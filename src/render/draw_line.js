// @flow

const DepthMode = require('../gl/depth_mode');
const {lineUniformValues, linePatternUniformValues, lineSDFUniformValues} = require('./program/line_program');

import type Painter from './painter';
import type SourceCache from '../source/source_cache';
import type LineStyleLayer from '../style/style_layer/line_style_layer';
import type LineBucket from '../data/bucket/line_bucket';
import type {OverscaledTileID} from '../source/tile_id';

module.exports = function drawLine(painter: Painter, sourceCache: SourceCache, layer: LineStyleLayer, coords: Array<OverscaledTileID>) {
    if (painter.renderPass !== 'translucent') return;

    const opacity = layer.paint.get('line-opacity');
    if (opacity.constantOr(1) === 0) return;

    const depthMode = painter.depthModeForSublayer(0, DepthMode.ReadOnly);
    const colorMode = painter.colorModeForRenderPass();

    const programId =
        layer.paint.get('line-dasharray') ? 'lineSDF' :
        layer.paint.get('line-pattern') ? 'linePattern' : 'line';

    let firstTile = true;

    for (const coord of coords) {
        const tile = sourceCache.getTile(coord);
        const bucket: ?LineBucket = (tile.getBucket(layer): any);
        if (!bucket) continue;

        const programConfiguration = bucket.programConfigurations.get(layer.id);
        const prevProgram = painter.context.program.get();
        const program = painter.useProgram(programId, programConfiguration);
        const programChanged = firstTile || program.program !== prevProgram;

        drawLineTile(program, painter, tile, bucket, layer, coord, depthMode, colorMode, programConfiguration, programChanged);
        firstTile = false;
        // TODO once textures are refactored we'll also be able to remove this firstTile/programChanged logic
    }
};

function drawLineTile(program, painter, tile, bucket, layer, coord, depthMode, colorMode, programConfiguration, programChanged) {
    const context = painter.context;
    const gl = context.gl;
    const dasharray = layer.paint.get('line-dasharray');
    const image = layer.paint.get('line-pattern');

    let imagePosA, imagePosB;
    if (image) {            // TODO formerly only ran in tileRatioChanged || programChanged code path, jic
        imagePosA = painter.imageManager.getPattern(image.from);
        imagePosB = painter.imageManager.getPattern(image.to);
        if (!imagePosA || !imagePosB) return;
    }

    if (programChanged) {
        if (dasharray) {
            context.activeTexture.set(gl.TEXTURE0);
            painter.lineAtlas.bind(context);
        } else if (image) {
            context.activeTexture.set(gl.TEXTURE0);
            painter.imageManager.bind(context);
        }
    }

    const stencilMode = painter.stencilModeForClipping(coord);
    const matrix = painter.translatePosMatrix(coord.posMatrix, tile, layer.paint.get('line-translate'), layer.paint.get('line-translate-anchor'));

    let uniformValues;
    if (dasharray) {
        uniformValues = lineSDFUniformValues(matrix, painter.transform, tile, dasharray, painter.lineAtlas, layer.layout.get('line-cap') === 'round');
    } else if (image) {
        if (!imagePosA || !imagePosB) return;       // TODO this is redundant but one way to appease flow...reconsider
        uniformValues = linePatternUniformValues(matrix, painter.transform, tile, image, imagePosA, imagePosB, painter.imageManager.getPixelSize());
    } else {
        uniformValues = lineUniformValues(matrix, painter.transform, tile);
    }

    program.fixedUniforms.set(program.uniforms, uniformValues);

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
            layer.paint,
            painter.transform.zoom,
            programConfiguration);
}
