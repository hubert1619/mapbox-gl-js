// @flow

const {
    Uniform1i,
    Uniform1f,
    Uniform2fv,
    Uniforms
} = require('../uniform_binding');
const assert = require('assert');
const pixelsToTileUnits = require('../../source/pixels_to_tile_units');

import type Painter from '../painter';
import type {OverscaledTileID} from '../../source/tile_id';
import type {CrossFaded} from '../../style/cross_faded';
import type {UniformValues} from '../uniform_binding';
import type Context from '../../gl/context';

const patternUniforms = (context: Context) => {
    return new Uniforms({
        'u_image': new Uniform1i(context),
        'u_pattern_tl_a': new Uniform2fv(context),
        'u_pattern_br_a': new Uniform2fv(context),
        'u_pattern_tl_b': new Uniform2fv(context),
        'u_pattern_br_b': new Uniform2fv(context),
        'u_texsize': new Uniform2fv(context),
        'u_mix': new Uniform1f(context),
        'u_pattern_size_a': new Uniform2fv(context),
        'u_pattern_size_b': new Uniform2fv(context),
        'u_scale_a': new Uniform1f(context),
        'u_scale_b': new Uniform1f(context),
        'u_pixel_coord_upper': new Uniform2fv(context),
        'u_pixel_coord_lower': new Uniform2fv(context),
        'u_tile_units_to_pixels': new Uniform1f(context)
    });
};

function prepare(image: CrossFaded<string>, painter: Painter): UniformValues {
    const context = painter.context;
    const gl = context.gl;

    const imagePosA = painter.imageManager.getPattern(image.from);
    const imagePosB = painter.imageManager.getPattern(image.to);
    assert(imagePosA && imagePosB);
    const {width, height} = painter.imageManager.getPixelSize();

    context.activeTexture.set(gl.TEXTURE0);
    painter.imageManager.bind(painter.context);

    return {
        'u_image': 0,
        'u_pattern_tl_a': (imagePosA: any).tl,
        'u_pattern_br_a': (imagePosA: any).br,
        'u_pattern_tl_b': (imagePosB: any).tl,
        'u_pattern_br_b': (imagePosB: any).br,
        'u_texsize': [width, height],
        'u_mix': image.t,
        'u_pattern_size_a': (imagePosA: any).displaySize,
        'u_pattern_size_b': (imagePosB: any).displaySize,
        'u_scale_a': image.fromScale,
        'u_scale_b': image.toScale
    };
}

function setTile(tile: {tileID: OverscaledTileID, tileSize: number}, painter: Painter): UniformValues {
    const numTiles = Math.pow(2, tile.tileID.overscaledZ);
    const tileSizeAtNearestZoom = tile.tileSize * Math.pow(2, painter.transform.tileZoom) / numTiles;

    const pixelX = tileSizeAtNearestZoom * (tile.tileID.canonical.x + tile.tileID.wrap * numTiles);
    const pixelY = tileSizeAtNearestZoom * tile.tileID.canonical.y;

    return {
        'u_tile_units_to_pixels': 1 / pixelsToTileUnits(tile, 1, painter.transform.tileZoom),
        // split the pixel coord into two pairs of 16 bit numbers. The glsl spec only guarantees 16 bits of precision.
        'u_pixel_coord_upper': [pixelX >> 16, pixelY >> 16],
        'u_pixel_coord_lower': [pixelX & 0xFFFF, pixelY & 0xFFFF]
    };
}


module.exports = { patternUniforms, prepare, setTile };
