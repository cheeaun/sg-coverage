const fs = require('fs');
const { featureCollection, polygon, multiPolygon, booleanPointInPolygon, round } = require('@turf/turf');
const boundaryFeature = require('./sg-region-boundary.json');

const width = 217, height = 120;
const lowerLat = 1.156, upperLat = 1.475, lowerLong = 103.565, upperLong = 104.130;
const distanceLat = Math.abs(upperLat - lowerLat);
const distanceLong = Math.abs(upperLong - lowerLong);

const sgCoverageData = [];
const sgCoverageIndicesData = [];
const polygons = [];
const sgPolygons = [];
for (let y=0; y<height; y++) {
  console.log(y);
  sgCoverageData.push([]);
  sgCoverageIndicesData.push([]);
  for (let x=0; x<width; x++) {
    const lLong = round(lowerLong + (x/width*distanceLong), 4);
    const uLong = round(lowerLong + ((x+1)/width*distanceLong), 4);
    const lLat = round(upperLat - (y/height*distanceLat), 4);
    const uLat = round(upperLat - ((y+1)/height*distanceLat), 4);
    const p = [
      [lLong, uLat],
      [uLong, uLat],
      [uLong, lLat],
      [lLong, lLat],
      [lLong, uLat]
    ];
    const overlap = p.some(point => {
      return boundaryFeature.features.some(feature => {
        return booleanPointInPolygon(point, feature);
      });
    });
    if (overlap) {
      sgPolygons.push(p);
      sgCoverageIndicesData[y].push(x);
    }
    polygons.push(p);
    sgCoverageData[y].push(overlap ? 1 : 0);
  }
}
console.log('done');
const bboxPolygons = featureCollection(sgPolygons.map(sgp => polygon([sgp])));
console.log('SG Polygons: ', sgPolygons.length);

fs.writeFileSync('sgCoverage.geojson', JSON.stringify(bboxPolygons));
fs.writeFileSync('sgCoverage.json', JSON.stringify(sgCoverageData));
fs.writeFileSync('sgCoverageIndices.json', JSON.stringify(sgCoverageIndicesData));