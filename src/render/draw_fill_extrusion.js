// @flow

const glMatrix = require('@mapbox/gl-matrix');
const pattern = require('./pattern');
const Texture = require('./texture');
const Color = require('../style-spec/util/color');
const util = require('../util/util');
const DepthMode = require('../gl/depth_mode');
const mat3 = glMatrix.mat3;
const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;
const StencilMode = require('../gl/stencil_mode');

import type Painter from './painter';
import type SourceCache from '../source/source_cache';
import type FillExtrusionStyleLayer from '../style/style_layer/fill_extrusion_style_layer';
import type FillExtrusionBucket from '../data/bucket/fill_extrusion_bucket';
import type {OverscaledTileID} from '../source/tile_id';

module.exports = draw;

function draw(painter: Painter, source: SourceCache, layer: FillExtrusionStyleLayer, coords: Array<OverscaledTileID>) {
    if (layer.paint.get('fill-extrusion-opacity') === 0) {
        return;
    }

    if (painter.renderPass === 'offscreen') {
        drawToExtrusionFramebuffer(painter, layer);

        let first = true;
        for (const coord of coords) {
            const tile = source.getTile(coord);
            const bucket: ?FillExtrusionBucket = (tile.getBucket(layer): any);
            if (!bucket) continue;

            const depthMode = new DepthMode(painter.context.gl.LEQUAL, DepthMode.ReadWrite, [0, 1]),
                stencilMode = StencilMode.disabled,
                colorMode = painter.colorModeForRenderPass();

            drawExtrusion(painter, source, layer, tile, coord, bucket, first, depthMode, stencilMode, colorMode);
            first = false;
        }
    } else if (painter.renderPass === 'translucent') {
        drawExtrusionTexture(painter, layer);
    }
}

function drawToExtrusionFramebuffer(painter, layer) {
    const context = painter.context;
    const gl = context.gl;

    let renderTarget = layer.viewportFrame;

    if (painter.depthRboNeedsClear) {
        painter.setupOffscreenDepthRenderbuffer();
    }

    if (!renderTarget) {
        const texture = new Texture(context, {width: painter.width, height: painter.height, data: null}, gl.RGBA);
        texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);

        renderTarget = layer.viewportFrame = context.createFramebuffer(painter.width, painter.height);
        renderTarget.colorAttachment.set(texture.texture);
    }

    context.bindFramebuffer.set(renderTarget.framebuffer);
    renderTarget.depthAttachment.set(painter.depthRbo);

    if (painter.depthRboNeedsClear) {
        context.clear({ depth: 1 });
        painter.depthRboNeedsClear = false;
    }

    context.clear({ color: Color.transparent });
}

function drawExtrusionTexture(painter, layer) {
    const renderedTexture = layer.viewportFrame;
    if (!renderedTexture) return;

    const context = painter.context;
    const gl = context.gl;
    const program = painter.useProgram('extrusionTexture');

    context.setStencilMode(StencilMode.disabled);
    context.setDepthMode(DepthMode.disabled);
    context.setColorMode(painter.colorModeForRenderPass());

    context.activeTexture.set(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, renderedTexture.colorAttachment.get());

    const matrix = mat4.create();
    mat4.ortho(matrix, 0, painter.width, painter.height, 0, 0, 1);

    program.staticUniforms.set(program.uniforms, {
        u_opacity: layer.paint.get('fill-extrusion-opacity'),
        u_image: 0,
        u_matrix: matrix,
        u_world: [gl.drawingBufferWidth, gl.drawingBufferHeight]
    });

    painter.viewportVAO.bind(context, program, painter.viewportBuffer, []);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function drawExtrusion(painter, source, layer, tile, coord, bucket, first, depthMode, stencilMode, colorMode) {
    const context = painter.context;
    const gl = context.gl;

    const image = layer.paint.get('fill-extrusion-pattern');
    if (image && pattern.isPatternMissing(image, painter)) return;

    const prevProgram = painter.context.program.get();
    const programConfiguration = bucket.programConfigurations.get(layer.id);

    const program = painter.useProgram(image ? 'fillExtrusionPattern' : 'fillExtrusion', programConfiguration);
    if (first || program.program !== prevProgram) {
        programConfiguration.setUniforms(context, program, layer.paint, {zoom: painter.transform.zoom});
    }

    const light = painter.style.light;

    const _lp = light.properties.get('position');
    const lightPos = [_lp.x, _lp.y, _lp.z];
    const lightMat = mat3.create();
    if (light.properties.get('anchor') === 'viewport') {
        mat3.fromRotation(lightMat, -painter.transform.angle);
    }
    vec3.transformMat3(lightPos, lightPos, lightMat);

    const lightColor = light.properties.get('color');

    const uniformValues = {
        u_matrix: painter.translatePosMatrix(
            coord.posMatrix,
            tile,
            layer.paint.get('fill-extrusion-translate'),
            layer.paint.get('fill-extrusion-translate-anchor')
        ),
        u_lightpos: lightPos,
        u_lightintensity: light.properties.get('intensity'),
        u_lightcolor: [lightColor.r, lightColor.g, lightColor.b]
    };

    if (image) {
        util.extend(uniformValues,
            pattern.prepare(image, painter, program),
            pattern.setTile(tile, painter, program),
            { u_height_factor: -Math.pow(2, coord.overscaledZ) / tile.tileSize / 8 });
    }

    program._draw(
        context,
        gl.TRIANGLES,
        depthMode,
        stencilMode,
        colorMode,
        uniformValues,
        layer.id,
        bucket.layoutVertexBuffer,
        bucket.indexBuffer,
        bucket.segments,
        // paint property binders,
        layer.paint,
        painter.transform.zoom,
        programConfiguration);
}
