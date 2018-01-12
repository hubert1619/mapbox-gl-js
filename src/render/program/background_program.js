// @flow

const {patternUniforms} = require('./pattern');
const {
    Uniform1f,
    Uniform4fv,
    UniformMatrix4fv,
    Uniforms
} = require('../uniform_binding');
const pattern = require('./pattern');
const util = require('../../util/util');

import type Painter from '../painter';
import type {UniformValues} from '../uniform_binding';
import type Context from '../../gl/context';
import type Color from '../../style-spec/util/color';
import type {CrossFaded} from '../../style/cross_faded';
import type {OverscaledTileID} from '../../source/tile_id';

const backgroundUniforms = (context: Context) => {
    return new Uniforms({
        'u_matrix': new UniformMatrix4fv(context),
        'u_opacity': new Uniform1f(context),
        'u_color': new Uniform4fv(context)
    });
};

const backgroundPatternUniforms = (context: Context) => {
    return patternUniforms(context)
        .concatenate(new Uniforms({
            'u_matrix': new UniformMatrix4fv(context),
            'u_opacity': new Uniform1f(context)
        }));
};

function backgroundUniformValues(
    matrix: Float32Array,
    opacity: number,
    color: Color
): UniformValues {
    return {
        'u_matrix': matrix,
        'u_opacity': opacity,
        'u_color': [color.r, color.g, color.b, color.a]
    };
}

function backgroundPatternUniformValues(
    matrix: Float32Array,
    opacity: number,
    painter: Painter,
    image: CrossFaded<string>,
    tile: {tileID: OverscaledTileID, tileSize: number}
): UniformValues {
    return util.extend(pattern.prepare(image, painter),
        pattern.setTile(tile, painter),
        {
            'u_matrix': matrix,
            'u_opacity': opacity
        });
}

module.exports = { backgroundUniforms, backgroundPatternUniforms, backgroundUniformValues, backgroundPatternUniformValues };
