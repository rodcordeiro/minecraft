/*

This is a JavaScript file you can edit to add custom markers to the map.
uNmINeD does not overwrite this file during map generation.

Steps:

    1. Edit this file using Notepad or a code editor (do not use document editors like Microsoft Word)
    2. Change the line "isEnabled: false," to "isEnabled: true," to display the markers
    3. Change or remove the example markers
    4. Add your own markers

Marker format:

    {
        x: X coordinate of the marker (in Minecraft block units),
        z: Z coordinate of the marker (in Minecraft block units),
        image: marker image URL to display (in quotes),
        imageScale: scale of the image (e.g. 1 = display full size, 0.5 = display half size),
        imageAnchor: [0.5, 1] means the tip of the pin is at the center-bottom of the image (see OpenLayers documentation for more info),
        text: marker text do display (in quotes),
        textColor: text color in HTML/CSS format (in quotes),
        offsetX: horizontal pixel offset of the text,
        offsetY: vertical pixel offset of the text,
        font: text font in HTML/CSS format (in quotes),
    },

Things to keep in mind:

* There are opening and closing brackets for each marker "{" and "}"
* Property names are case sensitive (i.e. "textColor" is okay, "TextColor" is not)
* There is a comma (",") at the end of each line except the opening brackets ("{")

You can use https://mapmarker.io/editor to generate custom pin images.
Use the imageScale property if the pin image is too large.

*/

UnminedCustomMarkers = {

    isEnabled: true,

    markers: [
        {
            x: 7,
            z: -36,
            image: "custom.pin.png",
            imageAnchor: [0.5, 1],
            imageScale: 0.5,
            text: "Casa",
            textColor: "#f8fafc",
            offsetX: 0,
            offsetY: 20,
            font: "bold 18px Calibri,sans serif",
        },
        {
            x: -296,
            z: -296,
            image: "custom.pin.png",
            imageAnchor: [0.5, 1],
            imageScale: 0.5,
            text: "Alvorada Branca (Vila)",
            textColor: "#fde047",
            offsetX: 0,
            offsetY: 20,
            font: "bold 18px Calibri,sans serif",
        },
        {
            x: -360,
            z: 296,
            image: "custom.pin.png",
            imageAnchor: [0.5, 1],
            imageScale: 0.5,
            text: "Ermo da Neve (Vila)",
            textColor: "#fde047",
            offsetX: 0,
            offsetY: 20,
            font: "bold 18px Calibri,sans serif",
        },
        {
            x: 344,
            z: -360,
            image: "custom.pin.png",
            imageAnchor: [0.5, 1],
            imageScale: 0.5,
            text: "Pinhal de Valkaria (Vila)",
            textColor: "#fde047",
            offsetX: 0,
            offsetY: 20,
            font: "bold 18px Calibri,sans serif",
        },
        {
            x: -145,
            z: -166,
            image: "custom.pin.png",
            imageAnchor: [0.5, 1],
            imageScale: 0.5,
            text: "Reduto dos Colonos (Breeder)",
            textColor: "#86efac",
            offsetX: 0,
            offsetY: 20,
            font: "bold 18px Calibri,sans serif",
        },
        {
            x: 140,
            z: -150,
            image: "custom.pin.png",
            imageAnchor: [0.5, 1],
            imageScale: 0.5,
            text: "Forja da Aurora (IronFarm)",
            textColor: "#86efac",
            offsetX: 0,
            offsetY: 20,
            font: "bold 18px Calibri,sans serif",
        },
        {
            x: 426,
            z: -29,
            image: "custom.pin.png",
            imageAnchor: [0.5, 1],
            imageScale: 0.5,
            text: "Torre dos Espinhos (Farm)",
            textColor: "#86efac",
            offsetX: 0,
            offsetY: 20,
            font: "bold 18px Calibri,sans serif",
        },
        {
            x: 7,
            z: 156,
            image: "custom.pin.png",
            imageAnchor: [0.5, 1],
            imageScale: 0.5,
            text: "Torre da Vigilia (MobFarm)",
            textColor: "#fca5a5",
            offsetX: 0,
            offsetY: 20,
            font: "bold 18px Calibri,sans serif",
        },
        {
            x: -424,
            z: -184,
            image: "custom.pin.png",
            imageAnchor: [0.5, 1],
            imageScale: 0.5,
            text: "Abrigo da Geada (Igloo)",
            textColor: "#93c5fd",
            offsetX: 0,
            offsetY: 20,
            font: "bold 18px Calibri,sans serif",
        },
        {
            x: 7432,
            z: -2840,
            image: "custom.pin.png",
            imageAnchor: [0.5, 1],
            imageScale: 0.5,
            text: "Cabana de bruxa",
            textColor: "#f9a8d4",
            offsetX: 0,
            offsetY: 20,
            font: "bold 18px Calibri,sans serif",
        },

        // do not delete the following two closing brackets
    ]
}

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
            name: "Ramal Torre dos Espinhos",
            color: "#34d399",
            width: 3,
            stations: true,
            points: [
                [140, -150],
                [426, -150],
                [426, -29],
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

/**
 * Cria a camada vetorial das ferrovias personalizadas.
 * @param {Unmined} unmined
 * @param {{ isEnabled: boolean, routes: Array<any> }} railways
 * @returns {ol.layer.Vector | null}
 */
function createCustomRailwaysLayer(unmined, railways) {
    if (!railways || !railways.isEnabled || !railways.routes || railways.routes.length === 0) {
        return null;
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

    return new ol.layer.Vector({
        source: new ol.source.Vector({
            features: features,
        }),
    });
}

/**
 * Instala um hook no ciclo de criacao dos marcadores do uNmINeD para anexar a camada de ferrovias.
 * @returns {void}
 */
function installCustomRailwaysHook() {
    if (typeof Unmined === "undefined" || !Unmined.prototype || Unmined.prototype.__customRailwaysHookInstalled) {
        return;
    }

    const originalCreateMarkersLayer = Unmined.prototype.createMarkersLayer;

    Unmined.prototype.createMarkersLayer = function (markers) {
        const layer = originalCreateMarkersLayer.call(this, markers);

        if (!this.__customRailwaysAdded && this.olMap) {
            const railwaysLayer = createCustomRailwaysLayer(this, UnminedCustomRailways);
            if (railwaysLayer) {
                this.olMap.addLayer(railwaysLayer);
                this.__customRailwaysAdded = true;
            }
        }

        return layer;
    };

    Unmined.prototype.__customRailwaysHookInstalled = true;
}

/**
 * Gera marcadores de texto ao longo das rotas para garantir visualizacao da ferrovia.
 * @param {{ routes: Array<any> }} railways
 * @returns {Array<any>}
 */
function buildRailwayMarkers(railways) {
    if (!railways || !railways.isEnabled || !railways.routes) {
        return [];
    }

    const markers = [];

    for (const route of railways.routes) {
        const step = route.markerStep || 32;

        for (let i = 0; i < route.points.length - 1; i++) {
            const [startX, startZ] = route.points[i];
            const [endX, endZ] = route.points[i + 1];

            if (startX !== endX && startZ !== endZ) {
                continue;
            }

            const deltaX = endX - startX;
            const deltaZ = endZ - startZ;
            const distance = Math.max(Math.abs(deltaX), Math.abs(deltaZ));
            const dirX = deltaX === 0 ? 0 : deltaX / Math.abs(deltaX);
            const dirZ = deltaZ === 0 ? 0 : deltaZ / Math.abs(deltaZ);

            for (let offset = step; offset < distance; offset += step) {
                markers.push({
                    x: startX + dirX * offset,
                    z: startZ + dirZ * offset,
                    text: "+",
                    textColor: route.color || "#f59e0b",
                    textStrokeColor: "#111827",
                    textStrokeWidth: 2,
                    offsetX: 0,
                    offsetY: 0,
                    font: "bold 18px Calibri,sans serif",
                });
            }
        }
    }

    return markers;
}

if (typeof UnminedMapProperties !== "undefined" && UnminedMapProperties.markers) {
    const originalConcat = Array.prototype.concat;
    UnminedMapProperties.markers.concat = function () {
        installCustomRailwaysHook();
        return originalConcat.apply(this, arguments);
    };
}

if (UnminedCustomMarkers && Array.isArray(UnminedCustomMarkers.markers)) {
    UnminedCustomMarkers.markers = UnminedCustomMarkers.markers.concat(buildRailwayMarkers(UnminedCustomRailways));
}
