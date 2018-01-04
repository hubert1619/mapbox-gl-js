// @flow

const {
    Uniform1i,
    Uniform1f,
    Uniform2fv,
    Uniform4fv,
    UniformMatrix4fv,
    Uniforms
} = require('../uniform_binding');

import type Context from '../../gl/context';

const hillshadeUniforms = (context: Context) => {
    return new Uniforms({
        'u_light': new Uniform2fv(context),
        'u_matrix': new UniformMatrix4fv(context),
        'u_latrange': new Uniform2fv(context),
        'u_image': new Uniform1i(context),
        'u_shadow': new Uniform4fv(context),
        'u_highlight': new Uniform4fv(context),
        'u_accent': new Uniform4fv(context)
    });
};

const hillshadePrepareUniforms = (context: Context) => {
    return new Uniforms({
        'u_matrix': new UniformMatrix4fv(context),
        'u_zoom': new Uniform1f(context),
        'u_dimension': new Uniform2fv(context),
        'u_image': new Uniform1i(context),
        'u_maxzoom': new Uniform1f(context)
    });
}

module.exports = { hillshadeUniforms, hillshadePrepareUniforms };
