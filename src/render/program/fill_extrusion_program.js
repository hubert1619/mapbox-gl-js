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

// import type PatternUniforms from './pattern';
import type Program from '../program';
import type Context from '../../gl/context';

type PatternUniforms = {|                       // TODO for some reason this only works in FillExtrusionPatternUniforms when I inline it here — investigate
    'u_image': Uniform1i,
    'u_pattern_tl_a': Uniform2fv,
    'u_pattern_br_a': Uniform2fv,
    'u_pattern_tl_b': Uniform2fv,
    'u_pattern_br_b': Uniform2fv,
    'u_texsize': Uniform2fv,
    'u_mix': Uniform1f,
    'u_pattern_size_a': Uniform2fv,
    'u_pattern_size_b': Uniform2fv,
    'u_scale_a': Uniform1f,
    'u_scale_b': Uniform1f,
    'u_pixel_coord_upper': Uniform2fv,
    'u_pixel_coord_lower': Uniform2fv
    // 'u_tile_units_to_pixels': Uniform1f
|};

export type FillExtrusionUniforms = {|
    'u_matrix': UniformMatrix4fv,
    'u_lightpos': Uniform3fv,
    'u_lightintensity': Uniform1f,
    'u_lightcolor': Uniform3fv,
|};

export type FillExtrusionPatternUniforms = {|
    ...FillExtrusionUniforms,
    ...PatternUniforms,
    'u_height_factor': Uniform1f,
|};

export type ExtrusionTextureUniforms = {|
    'u_opacity': Uniform1f,
    'u_image': Uniform1i,
    'u_matrix': UniformMatrix4fv,
    'u_world': Uniform2fv
|};

const fillExtrusionUniforms = (context: Context, dynamicBinders: any/*, locations: {[key: string]: WebGLUniformLocation}*/) => {
    return new Uniforms({
        'u_matrix': new UniformMatrix4fv(context),
        'u_lightpos': new Uniform3fv(context),
        'u_lightintensity': new Uniform1f(context),
        'u_lightcolor': new Uniform3fv(context)
    });
}

const fillExtrusionPatternUniforms = (context: Context, dynamicBinders: any/*, locations: {[key: string]: WebGLUniformLocation}*/) => {
    return fillExtrusionUniforms(context, dynamicBinders)
        .concatenate(patternUniforms(context, dynamicBinders))
        .concatenate(new Uniforms({
            'u_height_factor': new Uniform1f(context)
    }));
}

const extrusionTextureUniforms = (context: Context/*, dynamicBinders: undefined, locations: {[key: string]: WebGLUniformLocation}*/) => {
    return new Uniforms({
        'u_opacity': new Uniform1f(context),
        'u_image': new Uniform1i(context),
        'u_matrix': new UniformMatrix4fv(context),
        'u_world': new Uniform2fv(context)
    });
}

module.exports = { fillExtrusionUniforms, fillExtrusionPatternUniforms, extrusionTextureUniforms };
