UnminedCustomRailways = {

    isEnabled: true,

    routes: [
        {
            name: "Linha Tronco Norte",
            color: "#f59e0b",
            width: 4,
            stations: true,
            points: [
                [7, -36],
                [7, -150],
            ],
        },
        {
            name: "Ramal Reduto dos Colonos",
            color: "#86efac",
            width: 3,
            stations: true,
            points: [
                [7, -150],
                [-145, -150],
                [-145, -166],
            ],
        },
        {
            name: "Ramal Forja da Aurora",
            color: "#fca5a5",
            width: 3,
            stations: true,
            points: [
                [7, -150],
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
            name: "Extensao Ermo da Neve",
            color: "#c4b5fd",
            width: 3,
            stations: true,
            points: [
                [-296, -296],
                [-296, 296],
                [-360, 296],
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
        {
            name: "Linha de Expedicao da Bruxa",
            color: "#e879f9",
            width: 3,
            stations: true,
            lineDash: [20, 10],
            points: [
                [7, -36],
                [7432, -36],
                [7432, -2840],
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
