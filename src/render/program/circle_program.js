// @flow

const {
    Uniform1i,
    Uniform1f,
    Uniform2fv,
    UniformMatrix4fv,
    Uniforms
} = require('../uniform_binding');

import type Context from '../../gl/context';

const circleUniforms = (context: Context) => {
    return new Uniforms({
        'u_camera_to_center_distance': new Uniform1f(context),
        'u_scale_with_map': new Uniform1i(context),
        'u_pitch_with_map': new Uniform1i(context),
        'u_extrude_scale': new Uniform2fv(context),
        'u_pitch_with_map': new Uniform1i(context),
        'u_extrude_scale': new Uniform2fv(context),
        'u_matrix': new UniformMatrix4fv(context)
    });
};

module.exports = { circleUniforms };
