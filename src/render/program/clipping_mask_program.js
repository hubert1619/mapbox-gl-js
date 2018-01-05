// @flow

const {
    UniformMatrix4fv,
    Uniforms
} = require('../uniform_binding');

import type Context from '../../gl/context';
import type {UniformValues} from '../uniform_binding';

const clippingMaskUniforms = (context: Context) => {
    return new Uniforms({
        'u_matrix': new UniformMatrix4fv(context)
    });
};

function clippingMaskUniformValues(matrix: Float32Array): UniformValues {
    return {
        'u_matrix': matrix
    };
}

module.exports = { clippingMaskUniforms, clippingMaskUniformValues };
