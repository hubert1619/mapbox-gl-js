// @flow

const {
    Uniform1f,
    Uniform2fv,
    UniformMatrix4fv,
    Uniforms
} = require('../uniform_binding');

import type Context from '../../gl/context';

const collisionUniforms = (context: Context) => {
    return new Uniforms({
        'u_matrix': new UniformMatrix4fv(context),
        'u_camera_to_center_distance': new Uniform1f(context),
        'u_pixels_to_tile_units': new Uniform1f(context),
        'u_extrude_scale': new Uniform2fv(context),
        'u_overscale_factor': new Uniform1f(context)
    });
};

module.exports = { collisionUniforms };
