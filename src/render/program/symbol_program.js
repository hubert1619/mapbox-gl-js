// @flow

const {
    Uniform1i,
    Uniform1f,
    Uniform2fv,
    UniformMatrix4fv,
    Uniforms
} = require('../uniform_binding');

import type Context from '../../gl/context';


const symbolIconUniforms = (context: Context) => {
    return new Uniforms({
        'u_texture': new Uniform1i(context),
        'u_matrix': new UniformMatrix4fv(context),
        'u_label_plane_matrix': new UniformMatrix4fv(context),
        'u_fade_change': new Uniform1f(context),
        'u_pitch_with_map': new Uniform1i(context),
        'u_is_text': new Uniform1f(context),
        'u_is_size_zoom_constant': new Uniform1i(context),
        'u_is_size_feature_constant': new Uniform1i(context),
        'u_camera_to_center_distance': new Uniform1f(context),
        'u_size_t': new Uniform1f(context),
        'u_size': new Uniform1f(context),
        'u_aspect_ratio': new Uniform1f(context),
        'u_rotate_symbol': new Uniform1i(context),
        'u_pitch': new Uniform1f(context),
        'u_gl_coord_matrix': new UniformMatrix4fv(context),
        'u_texsize': new Uniform2fv(context)
    });
}

const symbolSDFUniforms = (context: Context) => {
    return symbolIconUniforms(context)
        .concatenate(new Uniforms({
            'u_gamma_scale': new Uniform1f(context),
            'u_is_halo': new Uniform1f(context)
        }));
}

module.exports = { symbolIconUniforms, symbolSDFUniforms };
