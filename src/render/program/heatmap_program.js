// @flow

const {
    Uniform1i,
    Uniform1f,
    Uniform2fv,
    UniformMatrix4fv,
    Uniforms
} = require('../uniform_binding');
const pixelsToTileUnits = require('../../source/pixels_to_tile_units');
const mat4 = require('@mapbox/gl-matrix').mat4;

import type Context from '../../gl/context';
import type Tile from '../../source/tile';
import type {UniformValues} from '../uniform_binding';
import type Painter from '../painter';
import type HeatmapStyleLayer from '../../style/style_layer/heatmap_style_layer';

const heatmapUniforms = (context: Context) => {
    return new Uniforms({
        'u_extrude_scale': new Uniform1f(context),
        'u_intensity': new Uniform1f(context),
        'u_matrix': new UniformMatrix4fv(context)
    });
};

const heatmapTextureUniforms = (context: Context) => {
    return new Uniforms({
        'u_matrix': new UniformMatrix4fv(context),
        'u_world': new Uniform2fv(context),
        'u_image': new Uniform1i(context),
        'u_color_ramp': new Uniform1i(context),
        'u_opacity': new Uniform1f(context)
    });
};

function heatmapUniformValues(
    matrix: Float32Array,
    tile: Tile,
    zoom: number,
    intensity: number
): UniformValues {
    return {
        'u_matrix': matrix,
        'u_extrude_scale': pixelsToTileUnits(tile, 1, zoom),
        'u_intensity': intensity
    };
}

function heatmapTextureUniformValues(
    painter: Painter,
    layer: HeatmapStyleLayer,
    textureUnit: number,
    colorRampUnit: number
): UniformValues {
    const matrix = mat4.create();
    mat4.ortho(matrix, 0, painter.width, painter.height, 0, 0, 1);

    const gl = painter.context.gl;

    return {
        'u_matrix': matrix,
        'u_world': [gl.drawingBufferWidth, gl.drawingBufferHeight],
        'u_image': textureUnit,
        'u_color_ramp': colorRampUnit,
        'u_opacity': layer.paint.get('heatmap-opacity')
    };
}

module.exports = { heatmapUniforms, heatmapTextureUniforms, heatmapUniformValues, heatmapTextureUniformValues };
