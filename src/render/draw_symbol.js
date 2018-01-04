// @flow

const drawCollisionDebug = require('./draw_collision_debug');
const pixelsToTileUnits = require('../source/pixels_to_tile_units');
const symbolProjection = require('../symbol/projection');
const symbolSize = require('../symbol/symbol_size');
const mat4 = require('@mapbox/gl-matrix').mat4;
const identityMat4 = mat4.identity(new Float32Array(16));
const symbolLayoutProperties = require('../style/style_layer/symbol_style_layer_properties').layout;
const StencilMode = require('../gl/stencil_mode');
const DepthMode = require('../gl/depth_mode');

import type Painter from './painter';
import type SourceCache from '../source/source_cache';
import type SymbolStyleLayer from '../style/style_layer/symbol_style_layer';
import type SymbolBucket from '../data/bucket/symbol_bucket';
import type {OverscaledTileID} from '../source/tile_id';

module.exports = drawSymbols;

function drawSymbols(painter: Painter, sourceCache: SourceCache, layer: SymbolStyleLayer, coords: Array<OverscaledTileID>) {
    if (painter.renderPass !== 'translucent') return;

    const context = painter.context;

    // Disable the stencil test so that labels aren't clipped to tile boundaries.
    context.setStencilMode(StencilMode.disabled);
    context.setColorMode(painter.colorModeForRenderPass());

    if (layer.paint.get('icon-opacity').constantOr(1) !== 0) {
        drawLayerSymbols(painter, sourceCache, layer, coords, false,
            layer.paint.get('icon-translate'),
            layer.paint.get('icon-translate-anchor'),
            layer.layout.get('icon-rotation-alignment'),
            layer.layout.get('icon-pitch-alignment'),
            layer.layout.get('icon-keep-upright')
        );
    }

    if (layer.paint.get('text-opacity').constantOr(1) !== 0) {
        drawLayerSymbols(painter, sourceCache, layer, coords, true,
            layer.paint.get('text-translate'),
            layer.paint.get('text-translate-anchor'),
            layer.layout.get('text-rotation-alignment'),
            layer.layout.get('text-pitch-alignment'),
            layer.layout.get('text-keep-upright')
        );
    }

    if (sourceCache.map.showCollisionBoxes) {
        drawCollisionDebug(painter, sourceCache, layer, coords);
    }
}

function drawLayerSymbols(painter, sourceCache, layer, coords, isText, translate, translateAnchor,
    rotationAlignment, pitchAlignment, keepUpright) {

    const context = painter.context;
    const gl = context.gl;
    const tr = painter.transform;

    const rotateWithMap = rotationAlignment === 'map';
    const pitchWithMap = pitchAlignment === 'map';
    const alongLine = rotateWithMap && layer.layout.get('symbol-placement') === 'line';
    // Line label rotation happens in `updateLineLabels`
    // Pitched point labels are automatically rotated by the labelPlaneMatrix projection
    // Unpitched point labels need to have their rotation applied after projection
    const rotateInShader = rotateWithMap && !pitchWithMap && !alongLine;

    const depthOn = pitchWithMap;

    context.setDepthMode(depthOn ? painter.depthModeForSublayer(0, DepthMode.ReadOnly) : DepthMode.disabled);

    let program;

    for (const coord of coords) {
        const tile = sourceCache.getTile(coord);
        const bucket: SymbolBucket = (tile.getBucket(layer): any);
        if (!bucket) continue;
        const buffers = isText ? bucket.text : bucket.icon;
        if (!buffers || !buffers.segments.get().length) continue;
        const programConfiguration = buffers.programConfigurations.get(layer.id);

        const isSDF = isText || bucket.sdfIcons;

        const sizeData = isText ? bucket.textSizeData : bucket.iconSizeData;

        if (!program) {
            program = painter.useProgram(isSDF ? 'symbolSDF' : 'symbolIcon', programConfiguration);
            programConfiguration.setUniforms(painter.context, program, layer.paint, {zoom: painter.transform.zoom});

            setSymbolDrawState(program, painter, layer, isText, rotateInShader, pitchWithMap, sizeData);
        }

        context.activeTexture.set(gl.TEXTURE0);

        let texSize;
        if (isText) {
            tile.glyphAtlasTexture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);
            texSize = tile.glyphAtlasTexture.size;
        } else {
            const iconScaled = layer.layout.get('icon-size').constantOr(0) !== 1 || bucket.iconsNeedLinear;
            const iconTransformed = pitchWithMap || tr.pitch !== 0;

            tile.iconAtlasTexture.bind(isSDF || painter.options.rotating || painter.options.zooming || iconScaled || iconTransformed ?
                gl.LINEAR : gl.NEAREST, gl.CLAMP_TO_EDGE);

            texSize = tile.glyphAtlasTexture.size;
        }

        const s = pixelsToTileUnits(tile, 1, painter.transform.zoom);
        const labelPlaneMatrix = symbolProjection.getLabelPlaneMatrix(coord.posMatrix, pitchWithMap, rotateWithMap, painter.transform, s);
        const glCoordMatrix = symbolProjection.getGlCoordMatrix(coord.posMatrix, pitchWithMap, rotateWithMap, painter.transform, s);

        program.staticUniforms.set(program.uniforms, {
            u_texture: 0,
            u_texsize: texSize,
            u_matrix: painter.translatePosMatrix(coord.posMatrix, tile, translate, translateAnchor),
            u_gl_coord_matrix: painter.translatePosMatrix(glCoordMatrix, tile, translate, translateAnchor, true),
            u_label_plane_matrix: alongLine ? identityMat4 : labelPlaneMatrix,
            u_fade_change: painter.options.fadeDuration ? painter.symbolFadeChange : 1
        });

        if (alongLine) {
            symbolProjection.updateLineLabels(bucket, coord.posMatrix, painter, isText, labelPlaneMatrix, glCoordMatrix, pitchWithMap, keepUpright);
        }

        drawTileSymbols(program, programConfiguration, painter, layer, tile, buffers, isText, isSDF, pitchWithMap);
    }
}

function setSymbolDrawState(program, painter, layer, isText, rotateInShader, pitchWithMap, sizeData) {

    const gl = painter.context.gl;
    const tr = painter.transform;

    const isZoomConstant = sizeData.functionType === 'constant' || sizeData.functionType === 'source';
    const isFeatureConstant = sizeData.functionType === 'constant' || sizeData.functionType === 'camera';

    const size = symbolSize.evaluateSizeForZoom(sizeData, tr.zoom, symbolLayoutProperties.properties[isText ? 'text-size' : 'icon-size']);

    program.staticUniforms.set(program.uniforms, {
        u_pitch_with_map: pitchWithMap ? 1 : 0,
        u_is_text: isText ? 1 : 0,
        u_pitch: tr.pitch / 360 * 2 * Math.PI,
        u_is_size_zoom_constant: isZoomConstant ? 1 : 0,
        u_is_size_feature_constant: isFeatureConstant ? 1 : 0,
        u_camera_to_center_distance: tr.cameraToCenterDistance,
        u_aspect_ratio: tr.width / tr.height,
        u_rotate_symbol: rotateInShader ? 1 : 0,
        u_size_t: size.uSizeT,              // TODO both this and u_size checked for undefined before -- is this ok to set even if undef?
        u_size: size.uSize,                     // (also bc set(undef) might trip up flow). If so, use util.extend?
    });
}

function drawTileSymbols(program, programConfiguration, painter, layer, tile, buffers, isText, isSDF, pitchWithMap) {

    const context = painter.context;
    const gl = context.gl;
    const tr = painter.transform;

    if (isSDF) {
        const hasHalo = layer.paint.get(isText ? 'text-halo-width' : 'icon-halo-width').constantOr(1) !== 0;
        const gammaScale = (pitchWithMap ? Math.cos(tr._pitch) * tr.cameraToCenterDistance : 1);
        program.staticUniforms.set(program.uniforms, {
            u_gamma_scale: gammaScale
        });

        if (hasHalo) { // Draw halo underneath the text.
            program.staticUniforms.set(program.uniforms, {
                u_is_halo: 1
            });
            drawSymbolElements(buffers, layer, context, program);
        }

        program.staticUniforms.set(program.uniforms, {
            u_is_halo: 0
        });
    }

    drawSymbolElements(buffers, layer, context, program);
}

function drawSymbolElements(buffers, layer, context, program) {
    program.draw(
        context,
        context.gl.TRIANGLES,
        layer.id,
        buffers.layoutVertexBuffer,
        buffers.indexBuffer,
        buffers.segments,
        buffers.programConfigurations.get(layer.id),
        buffers.dynamicLayoutVertexBuffer,
        buffers.opacityVertexBuffer);
}
