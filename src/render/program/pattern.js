// @flow

const {
    Uniform1i,
    Uniform1f,
    Uniform2fv,
    Uniforms
} = require('../uniform_binding');

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

module.exports = { patternUniforms };
