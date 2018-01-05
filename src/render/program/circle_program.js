// @flow

const {
    Uniform1i,
    Uniform1f,
    Uniform2fv,
    UniformMatrix4fv,
    Uniforms
} = require('../uniform_binding');
const pixelsToTileUnits = require('../../source/pixels_to_tile_units');

import type Context from '../../gl/context';
import type Transform from '../../geo/transform';
import type {UniformValues} from '../uniform_binding';
import type Tile from '../../source/tile';

const circleUniforms = (context: Context): Uniforms => new Uniforms({
    'u_camera_to_center_distance': new Uniform1f(context),
    'u_scale_with_map': new Uniform1i(context),
    'u_pitch_with_map': new Uniform1i(context),
    'u_extrude_scale': new Uniform2fv(context),
    'u_matrix': new UniformMatrix4fv(context)
});

const circleUniformValues = (matrix: Float32Array,
                             transform: Transform,
                             tile: Tile,
                             pitchAlignMap: boolean,
                             scaleWithMap: boolean): UniformValues => {
    let pitchWithMap, extrudeScale;
    if (pitchAlignMap) {
        const pixelRatio = pixelsToTileUnits(tile, 1, transform.zoom);
        pitchWithMap = true;
        extrudeScale = [pixelRatio, pixelRatio];
    } else {
        pitchWithMap = false;
        extrudeScale = transform.pixelsToGLUnits;
    }

    return {
        'u_camera_to_center_distance': transform.cameraToCenterDistance,
        'u_scale_with_map': Number(scaleWithMap),
        'u_matrix': matrix,
        'u_pitch_with_map': Number(pitchWithMap),
        'u_extrude_scale': extrudeScale
    };
};

module.exports = { circleUniforms, circleUniformValues };
