const {fillExtrusionUniforms, fillExtrusionPatternUniforms, extrusionTextureUniforms} = require('./fill_extrusion_program');
const {fillUniforms, fillPatternUniforms, fillOutlineUniforms} = require('./fill_program');
const {circleUniforms} = require('./circle_program');
const {collisionUniforms} = require('./collision_program');
const {debugUniforms} = require('./debug_program');
const {heatmapUniforms, heatmapTextureUniforms} = require('./heatmap_program');
const {hillshadeUniforms, hillshadePrepareUniforms} = require('./hillshade_program');
const {lineUniforms, linePatternUniforms, lineSDFUniforms} = require('./line_program');
const {rasterUniforms} = require('./raster_program');
const {symbolIconUniforms, symbolSDFUniforms} = require('./symbol_program');

module.exports = {
    fillExtrusion: fillExtrusionUniforms,
    fillExtrusionPattern: fillExtrusionPatternUniforms,
    extrusionTexture: extrusionTextureUniforms,
    fill: fillUniforms,
    fillPattern: fillPatternUniforms,
    fillOutline: fillOutlineUniforms,
    circle: circleUniforms,
    collisionBox: collisionUniforms,
    collisionCircle: collisionUniforms,
    debug: debugUniforms,
    heatmap: heatmapUniforms,
    heatmapTexture: heatmapTextureUniforms,
    hillshade: hillshadeUniforms,
    hillshadePrepare: hillshadePrepareUniforms,
    line: lineUniforms,
    linePattern: linePatternUniforms,
    lineSDF: lineSDFUniforms,
    raster: rasterUniforms,
    symbolIcon: symbolIconUniforms,
    symbolSDF: symbolSDFUniforms,
};
