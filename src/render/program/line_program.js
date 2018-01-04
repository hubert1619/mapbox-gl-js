// @flow

const {
    Uniform1i,
    Uniform1f,
    Uniform2fv,
    UniformMatrix4fv,
    Uniforms
} = require('../uniform_binding');

import type Context from '../../gl/context';

const lineUniforms = (context: Context) => {
    return new Uniforms({
        'u_gl_units_to_pixels': new Uniform2fv(context),
        'u_matrix': new UniformMatrix4fv(context),
        'u_ratio': new Uniform1f(context)
    });
};

const linePatternUniforms = (context: Context) => {
    return lineUniforms(context)
        .concatenate(new Uniforms({
            'u_pattern_size_a': new Uniform2fv(context),
            'u_pattern_size_b': new Uniform2fv(context),
            'u_texsize': new Uniform2fv(context),
            'u_image': new Uniform1i(context),
            'u_pattern_tl_a': new Uniform2fv(context),
            'u_pattern_br_a': new Uniform2fv(context),
            'u_pattern_tl_b': new Uniform2fv(context),
            'u_pattern_br_b': new Uniform2fv(context),
            'u_fade': new Uniform1f(context)
        }));
}

const lineSDFUniforms = (context: Context) => {
    return lineUniforms(context)
        .concatenate(new Uniforms({
            'u_patternscale_a': new Uniform2fv(context),
            'u_patternscale_b': new Uniform2fv(context),
            'u_sdfgamma': new Uniform1f(context),
            'u_image': new Uniform1i(context),
            'u_tex_y_a': new Uniform1f(context),
            'u_tex_y_b': new Uniform1f(context),
            'u_mix': new Uniform1f(context)
        }));
}

module.exports = { lineUniforms, linePatternUniforms, lineSDFUniforms };
