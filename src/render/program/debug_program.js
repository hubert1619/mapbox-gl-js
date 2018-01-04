// @flow

const {
    Uniform4fv,
    UniformMatrix4fv,
    Uniforms
} = require('../uniform_binding');

import type Context from '../../gl/context';

const debugUniforms = (context: Context) => {
    return new Uniforms({
        'u_color': new Uniform4fv(context),
        'u_matrix': new UniformMatrix4fv(context)
    });
};

module.exports = { debugUniforms };
