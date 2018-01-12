// @flow

const {patternUniforms} = require('./pattern');
const {
    Uniform2fv,
    UniformMatrix4fv,
    Uniforms
} = require('../uniform_binding');
const pattern = require('./pattern');
const util = require('../../util/util');

import type Painter from '../painter';
import type {UniformValues} from '../uniform_binding';
import type Context from '../../gl/context';
import type {CrossFaded} from '../../style/cross_faded';
import type {OverscaledTileID} from '../../source/tile_id';

const fillUniforms = (context: Context) => {
    return new Uniforms({
        'u_matrix': new UniformMatrix4fv(context),
    });
};

const fillPatternUniforms = (context: Context) => {
    return fillUniforms(context)
        .concatenate(patternUniforms(context));
};

const fillOutlineUniforms = (context: Context) => {
    return fillUniforms(context)
        .concatenate(new Uniforms({
            'u_world': new Uniform2fv(context)
        }));
};

const fillOutlinePatternUniforms = (context: Context) => {
    return fillOutlineUniforms(context)
        .concatenate(patternUniforms(context));
};

function fillUniformValues(matrix: Float32Array): UniformValues {
    return {
        'u_matrix': matrix
    };
}

function fillPatternUniformValues(
    matrix: Float32Array,
    painter: Painter,
    image: CrossFaded<string>,
    tile: {tileID: OverscaledTileID, tileSize: number}
): UniformValues {
    return util.extend(fillUniformValues(matrix),
        pattern.prepare(image, painter),
        pattern.setTile(tile, painter));
}

function fillOutlineUniformValues(
    matrix: Float32Array,
    drawingBufferSize: Array<number>
): UniformValues {
    return {
        'u_matrix': matrix,
        'u_world': drawingBufferSize
    };
}

function fillOutlinePatternUniformValues(
    matrix: Float32Array,
    painter: Painter,
    image: CrossFaded<string>,
    tile: {tileID: OverscaledTileID, tileSize: number},
    drawingBufferSize: Array<number>
): UniformValues {
    return util.extend(fillPatternUniformValues(matrix, painter, image, tile), {
        'u_world': drawingBufferSize
    });
}

module.exports = {
    fillUniforms,
    fillPatternUniforms,
    fillOutlineUniforms,
    fillOutlinePatternUniforms,
    fillUniformValues,
    fillPatternUniformValues,
    fillOutlineUniformValues,
    fillOutlinePatternUniformValues
};
