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
import type {UniformValues} from '../uniform_binding';
import type Color from '../../style-spec/util/color';

const hillshadeUniforms = (context: Context) => {
    return new Uniforms({
        'u_matrix': new UniformMatrix4fv(context),
        'u_image': new Uniform1i(context),
        'u_latrange': new Uniform2fv(context),
        'u_light': new Uniform2fv(context),
        'u_shadow': new Uniform4fv(context),
        'u_highlight': new Uniform4fv(context),
        'u_accent': new Uniform4fv(context)
    });
};

const hillshadePrepareUniforms = (context: Context) => {
    return new Uniforms({
        'u_matrix': new UniformMatrix4fv(context),
        'u_image': new Uniform1i(context),
        'u_dimension': new Uniform2fv(context),
        'u_zoom': new Uniform1f(context),
        'u_maxzoom': new Uniform1f(context)
    });
};

function hillshadeUniformValues(matrix: Float32Array,
                                textureUnit: number,
                                latRange: Array<number>,
                                light: Array<number>,
                                shadow: Color,
                                highlight: Color,
                                accent: Color): UniformValues {
    return {
        'u_matrix': matrix,
        'u_image': textureUnit,
        'u_latrange': latRange,
        'u_light': light,
        'u_shadow': [shadow.r, shadow.g, shadow.b, shadow.a],
        'u_highlight': [highlight.r, highlight.g, highlight.b, highlight.a],
        'u_accent': [accent.r, accent.g, accent.b, accent.a]
    };
}

function hillshadeUniformPrepareValues(matrix: Float32Array, textureUnit: number,
        size: Array<number>, zoom: number, maxzoom: number): UniformValues {
    return {
        'u_matrix': matrix,
        'u_image': textureUnit,
        'u_dimension': size,
        'u_zoom': zoom,
        'u_maxzoom': maxzoom
    };
}

module.exports = { hillshadeUniforms, hillshadePrepareUniforms, hillshadeUniformValues, hillshadeUniformPrepareValues };
