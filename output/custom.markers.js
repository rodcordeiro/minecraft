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
