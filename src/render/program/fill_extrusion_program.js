// @flow

const {patternUniforms} = require('./pattern');
const {
    Uniform1i,
    Uniform1f,
    Uniform2fv,
    Uniform3fv,
    UniformMatrix4fv,
    Uniforms
} = require('../uniform_binding');

import type Context from '../../gl/context';

const fillExtrusionUniforms = (context: Context): Uniforms => {
    return new Uniforms({
        'u_matrix': new UniformMatrix4fv(context),
        'u_lightpos': new Uniform3fv(context),
        'u_lightintensity': new Uniform1f(context),
        'u_lightcolor': new Uniform3fv(context)
    });
}

const fillExtrusionPatternUniforms = (context: Context): Uniforms => {
    return fillExtrusionUniforms(context)
        .concatenate(patternUniforms(context))
        .concatenate(new Uniforms({
            'u_height_factor': new Uniform1f(context)
    }));
}

const extrusionTextureUniforms = (context: Context): Uniforms => {
    return new Uniforms({
        'u_opacity': new Uniform1f(context),
        'u_image': new Uniform1i(context),
        'u_matrix': new UniformMatrix4fv(context),
        'u_world': new Uniform2fv(context)
    });
}

module.exports = { fillExtrusionUniforms, fillExtrusionPatternUniforms, extrusionTextureUniforms };
