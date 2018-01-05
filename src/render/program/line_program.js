// @flow

const {
    Uniform1i,
    Uniform1f,
    Uniform2fv,
    UniformMatrix4fv,
    Uniforms
} = require('../uniform_binding');
const pixelsToTileUnits = require('../../source/pixels_to_tile_units');
const util = require('../../util/util');
const browser = require('../../util/browser');

import type Context from '../../gl/context';
import type {UniformValues} from '../uniform_binding';
import type Transform from '../../geo/transform';
import type Tile from '../../source/tile';
import type LineAtlas from '../line_atlas';
// import type ImageManager from '../image_manager';
import type {CrossFaded} from '../../style/cross_faded';
import type {ImagePosition} from '../image_atlas';


const lineUniforms = (context: Context) => {
    return new Uniforms({
        'u_matrix': new UniformMatrix4fv(context),
        'u_ratio': new Uniform1f(context),
        'u_gl_units_to_pixels': new Uniform2fv(context)
    });
};

const linePatternUniforms = (context: Context) => {
    return lineUniforms(context)
        .concatenate(new Uniforms({
            'u_pattern_size_a': new Uniform2fv(context),
            'u_pattern_size_b': new Uniform2fv(context),
            'u_texsize': new Uniform2fv(context),
            'u_image': new Uniform1i(context),
            'u_pattern_tl_a': new Uniform2fv(context),
            'u_pattern_br_a': new Uniform2fv(context),
            'u_pattern_tl_b': new Uniform2fv(context),
            'u_pattern_br_b': new Uniform2fv(context),
            'u_fade': new Uniform1f(context)
        }));
};

const lineSDFUniforms = (context: Context) => {
    return lineUniforms(context)
        .concatenate(new Uniforms({
            'u_patternscale_a': new Uniform2fv(context),
            'u_patternscale_b': new Uniform2fv(context),
            'u_sdfgamma': new Uniform1f(context),
            'u_image': new Uniform1i(context),
            'u_tex_y_a': new Uniform1f(context),
            'u_tex_y_b': new Uniform1f(context),
            'u_mix': new Uniform1f(context)
        }));
};

function lineUniformValues(matrix: Float32Array, transform: Transform, tile: Tile): UniformValues {
    return {
        'u_matrix': matrix,
        'u_ratio': 1 / pixelsToTileUnits(tile, 1, transform.zoom),
        'u_gl_units_to_pixels': [1 / transform.pixelsToGLUnits[0], 1 / transform.pixelsToGLUnits[1]]
    };
}

function linePatternUniformValues(matrix: Float32Array,
                                  transform: Transform,
                                  tile: Tile,
                                  image: CrossFaded<string>,
                                  imagePosA: ImagePosition,
                                  imagePosB: ImagePosition,
                                  pixelSize: {width: number, height: number}): UniformValues {
    const tileRatio = calculateTileRatio(tile, transform);

    return util.extend(lineUniformValues(matrix, transform, tile), {
        'u_pattern_size_a': [imagePosA.displaySize[0] * image.fromScale / tileRatio, imagePosB.displaySize[1]],
        'u_pattern_size_b': [imagePosB.displaySize[0] * image.toScale / tileRatio, imagePosB.displaySize[1]],
        'u_texsize': [pixelSize.width, pixelSize.height],
        'u_image': 0,
        'u_pattern_tl_a': imagePosA.tl,
        'u_pattern_br_a': imagePosA.br,
        'u_pattern_tl_b': imagePosB.tl,
        'u_pattern_br_b': imagePosB.br,
        'u_fade': image.t
    });
}

function lineSDFUniformValues(matrix: Float32Array,
                              transform: Transform,
                              tile: Tile,
                              dasharray: CrossFaded<Array<number>>,
                              lineAtlas: LineAtlas,
                              round: boolean): UniformValues {
    const tileRatio = calculateTileRatio(tile, transform);

    const posA = lineAtlas.getDash(dasharray.from, round);
    const posB = lineAtlas.getDash(dasharray.to, round);

    const widthA = posA.width * dasharray.fromScale;
    const widthB = posB.width * dasharray.toScale;

    return util.extend(lineUniformValues(matrix, transform, tile), {
        'u_patternscale_a': [tileRatio / widthA, -posA.height / 2],
        'u_patternscale_b': [tileRatio / widthB, -posB.height / 2],
        'u_sdfgamma': lineAtlas.width / (Math.min(widthA, widthB) * 256 * browser.devicePixelRatio) / 2,
        'u_image': 0,
        'u_tex_y_a': posA.y,
        'u_tex_y_b': posB.y,
        'u_mix': dasharray.t
    });
}

function calculateTileRatio(tile: Tile, transform: Transform) {
    return 1 / pixelsToTileUnits(tile, 1, transform.tileZoom);
}

module.exports = {
    lineUniforms,
    linePatternUniforms,
    lineSDFUniforms,
    lineUniformValues,
    linePatternUniformValues,
    lineSDFUniformValues
};
