UnminedCustomRailways = {

    isEnabled: true,

    routes: [
        {
            name: "Linha Tronco Sul",
            color: "#f59e0b",
            width: 4,
            stations: true,
            points: [
                [7, -36],
                [-145, -36],
                [-145, -166],
                [140, -166],
                [140, -150],
            ],
        },
        {
            name: "Ramal Alvorada Branca",
            color: "#fde047",
            width: 3,
            stations: true,
            points: [
                [-145, -166],
                [-145, -296],
                [-296, -296],
            ],
        },
        {
            name: "Ramal Pinhal de Valkaria",
            color: "#93c5fd",
            width: 3,
            stations: true,
            points: [
                [140, -150],
                [140, -360],
                [344, -360],
            ],
        },
    ],
};

function addCustomRailways(unmined, railways) {
    if (!railways || !railways.isEnabled || !railways.routes || railways.routes.length === 0) {
        return;
    }

    const features = [];

    for (const route of railways.routes) {
        const transformedPoints = route.points.map((point) =>
            ol.proj.transform(point, unmined.dataProjection, unmined.viewProjection)
        );

        const lineFeature = new ol.Feature({
            geometry: new ol.geom.LineString(transformedPoints),
        });

        lineFeature.setStyle(
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: route.color || "#f59e0b",
                    width: route.width || 4,
                    lineDash: route.lineDash || [12, 8],
                }),
            })
        );

        features.push(lineFeature);

        if (!route.stations) {
            continue;
        }

        for (const point of transformedPoints) {
            const stationFeature = new ol.Feature({
                geometry: new ol.geom.Point(point),
            });

            stationFeature.setStyle(
                new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 5,
                        fill: new ol.style.Fill({
                            color: route.color || "#f59e0b",
                        }),
                        stroke: new ol.style.Stroke({
                            color: "#111827",
                            width: 2,
                        }),
                    }),
                })
            );

            features.push(stationFeature);
        }
    }

    const railwayLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: features,
        }),
    });

    unmined.olMap.addLayer(railwayLayer);
}
