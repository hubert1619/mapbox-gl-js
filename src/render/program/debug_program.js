// @flow

const {
    Uniform4fv,
    UniformMatrix4fv,
    Uniforms
} = require('../uniform_binding');

import type Context from '../../gl/context';
import type {UniformValues} from '../uniform_binding';
import type Color from '../../style-spec/util/color';

const debugUniforms = (context: Context) => {
    return new Uniforms({
        'u_color': new Uniform4fv(context),
        'u_matrix': new UniformMatrix4fv(context)
    });
};

function debugUniformValues(matrix: Float32Array, color: Color): UniformValues {
    return {
        'u_matrix': matrix,
        'u_color': [color.r, color.g, color.b, color.a]
    };
}

module.exports = { debugUniforms, debugUniformValues };
