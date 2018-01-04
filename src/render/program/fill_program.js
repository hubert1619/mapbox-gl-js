// @flow

const {patternUniforms} = require('./pattern');
const {
    Uniform2fv,
    UniformMatrix4fv,
    Uniforms
} = require('../uniform_binding');

// import type PatternUniforms from './pattern';
import type Context from '../../gl/context';

const fillUniforms = (context: Context) => {
    return new Uniforms({
        'u_matrix': new UniformMatrix4fv(context),
    });
}

const fillPatternUniforms = (context: Context) => {
    return fillUniforms(context)
        .concatenate(patternUniforms(context));
}

const fillOutlineUniforms = (context: Context) => {
    return fillUniforms(context)
        .concatenate(new Uniforms({
            'u_world': new Uniform2fv(context)
        }))
}

module.exports = { fillUniforms, fillPatternUniforms, fillOutlineUniforms };
