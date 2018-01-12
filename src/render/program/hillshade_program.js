// @flow

const {
    Uniform1i,
    Uniform1f,
    Uniform2fv,
    Uniform4fv,
    UniformMatrix4fv,
    Uniforms
} = require('../uniform_binding');
const EXTENT = require('../../data/extent');
const mat4 = require('@mapbox/gl-matrix').mat4;
const Coordinate = require('../../geo/coordinate');

import type Context from '../../gl/context';
import type {UniformValues} from '../uniform_binding';
import type Tile from '../../source/tile';
import type Painter from '../painter';
import type HillshadeStyleLayer from '../../style/style_layer/hillshade_style_layer';
import type {OverscaledTileID} from '../../source/tile_id';

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

function hillshadeUniformValues(
    painter: Painter,
    tile: Tile,
    layer: HillshadeStyleLayer
): UniformValues {
    const shadow = layer.paint.get("hillshade-shadow-color");
    const highlight = layer.paint.get("hillshade-highlight-color");
    const accent = layer.paint.get("hillshade-accent-color");

    let azimuthal = layer.paint.get('hillshade-illumination-direction') * (Math.PI / 180);
    // modify azimuthal angle by map rotation if light is anchored at the viewport
    if (layer.paint.get('hillshade-illumination-anchor') === 'viewport') {
        azimuthal -= painter.transform.angle;
    }

    return {
        'u_matrix': painter.transform.calculatePosMatrix(tile.tileID.toUnwrapped(), true),
        'u_image': 0,
        'u_latrange': getTileLatRange(painter, tile.tileID),
        'u_light': [layer.paint.get('hillshade-exaggeration'), azimuthal],
        'u_shadow': [shadow.r, shadow.g, shadow.b, shadow.a],
        'u_highlight': [highlight.r, highlight.g, highlight.b, highlight.a],
        'u_accent': [accent.r, accent.g, accent.b, accent.a]
    };
}

function hillshadeUniformPrepareValues(
    tile: {dem: any, tileID: OverscaledTileID, maxzoom: number}
): UniformValues {
    const tileSize = tile.dem.level.dim;
    const matrix = mat4.create();
    // Flip rendering at y axis.
    mat4.ortho(matrix, 0, EXTENT, -EXTENT, 0, 0, 1);
    mat4.translate(matrix, matrix, [0, -EXTENT, 0]);

    return {
        'u_matrix': matrix,
        'u_image': 1,
        'u_dimension': [tileSize * 2, tileSize * 2],
        'u_zoom': tile.tileID.overscaledZ,
        'u_maxzoom': maxzoom
    };
}

function getTileLatRange(painter: Painter, tileID: OverscaledTileID) {
    // for scaling the magnitude of a points slope by its latitude
    const coordinate0 = tileID.toCoordinate();
    const coordinate1 = new Coordinate(
        coordinate0.column, coordinate0.row + 1, coordinate0.zoom);
    return [
        painter.transform.coordinateLocation(coordinate0).lat,
        painter.transform.coordinateLocation(coordinate1).lat
    ];
}

module.exports = { hillshadeUniforms, hillshadePrepareUniforms, hillshadeUniformValues, hillshadeUniformPrepareValues };
