// @flow

const {
    Uniform1f,
    Uniform2fv,
    UniformMatrix4fv,
    Uniforms
} = require('../uniform_binding');
const pixelsToTileUnits = require('../../source/pixels_to_tile_units');

import type Context from '../../gl/context';
import type {UniformValues} from '../uniform_binding';
import type Transform from '../../geo/transform';
import type Tile from '../../source/tile';

function collisionUniforms(context: Context): Uniforms {
    return new Uniforms({
        'u_matrix': new UniformMatrix4fv(context),
        'u_camera_to_center_distance': new Uniform1f(context),
        'u_pixels_to_tile_units': new Uniform1f(context),
        'u_extrude_scale': new Uniform2fv(context),
        'u_overscale_factor': new Uniform1f(context)
    });
}

function collisionUniformValues(
    matrix: Float32Array,
    transform: Transform,
    tile: Tile
): UniformValues {
    const pixelRatio = pixelsToTileUnits(tile, 1, transform.zoom);
    const scale = Math.pow(2, transform.zoom - tile.tileID.overscaledZ);
    const overscaleFactor = tile.tileID.overscaleFactor();
    return {
        'u_matrix': matrix,
        'u_camera_to_center_distance': transform.cameraToCenterDistance,
        'u_pixels_to_tile_units': pixelRatio,
        'u_extrude_scale': [transform.pixelsToGLUnits[0] / (pixelRatio * scale),
            transform.pixelsToGLUnits[1] / (pixelRatio * scale)],
        'u_overscale_factor': overscaleFactor
    };
}

module.exports = { collisionUniforms, collisionUniformValues };
