// @flow

const {
    Uniform1i,
    Uniform1f,
    Uniform2fv,
    Uniform3fv,
    UniformMatrix4fv,
    Uniforms
} = require('../uniform_binding');

import type Context from '../../gl/context';

const rasterUniforms = (context: Context) => {
    return new Uniforms({
        'u_brightness_low': new Uniform1f(context),
        'u_brightness_high': new Uniform1f(context),
        'u_saturation_factor': new Uniform1f(context),
        'u_contrast_factor': new Uniform1f(context),
        'u_spin_weights': new Uniform3fv(context),
        'u_buffer_scale': new Uniform1f(context),
        'u_image0': new Uniform1i(context),
        'u_image1': new Uniform1i(context),
        'u_matrix': new UniformMatrix4fv(context),
        'u_tl_parent': new Uniform2fv(context),
        'u_scale_parent': new Uniform1f(context),
        'u_fade_t': new Uniform1f(context),
        'u_opacity': new Uniform1f(context)
    });
};

module.exports = { rasterUniforms };
