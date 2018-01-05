// @flow

const StencilMode = require('../gl/stencil_mode');
const DepthMode = require('../gl/depth_mode');
const {circleUniformValues} = require('./program/circle_program');

import type Painter from './painter';
import type SourceCache from '../source/source_cache';
import type CircleStyleLayer from '../style/style_layer/circle_style_layer';
import type CircleBucket from '../data/bucket/circle_bucket';
import type {OverscaledTileID} from '../source/tile_id';

module.exports = drawCircles;

function drawCircles(painter: Painter, sourceCache: SourceCache, layer: CircleStyleLayer, coords: Array<OverscaledTileID>) {
    if (painter.renderPass !== 'translucent') return;

    const opacity = layer.paint.get('circle-opacity');
    const strokeWidth = layer.paint.get('circle-stroke-width');
    const strokeOpacity = layer.paint.get('circle-stroke-opacity');

    if (opacity.constantOr(1) === 0 && (strokeWidth.constantOr(1) === 0 || strokeOpacity.constantOr(1) === 0)) {
        return;
    }

    const context = painter.context;
    const gl = context.gl;

    const depthMode = painter.depthModeForSublayer(0, DepthMode.ReadOnly);
    // Turn off stencil testing to allow circles to be drawn across boundaries,
    // so that large circles are not clipped to tiles
    const stencilMode = StencilMode.disabled;
    const colorMode = painter.colorModeForRenderPass();

    for (let i = 0; i < coords.length; i++) {
        const coord = coords[i];

        const tile = sourceCache.getTile(coord);
        const bucket: ?CircleBucket<*> = (tile.getBucket(layer): any);
        if (!bucket) continue;

        const programConfiguration = bucket.programConfigurations.get(layer.id);
        const program = painter.useProgram('circle', programConfiguration);

        program._draw(
            context,
            gl.TRIANGLES,
            depthMode,
            stencilMode,
            colorMode,
            circleUniformValues(
                painter.translatePosMatrix(
                    coord.posMatrix,
                    tile,
                    layer.paint.get('circle-translate'),
                    layer.paint.get('circle-translate-anchor')),
                painter.transform,
                tile,
                layer.paint.get('circle-pitch-alignment') === 'map',
                layer.paint.get('circle-pitch-scale') === 'map'),
            layer.id,
            bucket.layoutVertexBuffer,
            bucket.indexBuffer,
            bucket.segments,
            layer.paint,
            painter.transform.zoom,
            programConfiguration);
    }
}
