// @flow

const {
    Uniform1i,
    Uniform1f,
    Uniform2fv,
    UniformMatrix4fv,
    Uniforms
} = require('../uniform_binding');

import type Context from '../../gl/context';

const heatmapUniforms = (context: Context) => {
    return new Uniforms({
        'u_extrude_scale': new Uniform1f(context),
        'u_intensity': new Uniform1f(context),
        'u_matrix': new UniformMatrix4fv(context)
    });
};

const heatmapTextureUniforms = (context: Context) => {
    return new Uniforms({
        'u_opacity': new Uniform1f(context),
        'u_image': new Uniform1i(context),
        'u_color_ramp': new Uniform1i(context),
        'u_matrix': new UniformMatrix4fv(context),
        'u_world': new Uniform2fv(context)
    });
}

module.exports = { heatmapUniforms, heatmapTextureUniforms };
