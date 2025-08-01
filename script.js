// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const convertBtn = document.getElementById('convert-btn');
    const markdownInput = document.getElementById('markdown-input');
    const jsmindContainer = document.getElementById('jsmind_container');

    let jm = null; // To hold the jsMind instance

    // Function to convert markmap data to jsMind format
    function convertToJsMindFormat(node, isRoot = true) {
        const jmNode = {
            id: node.key,
            topic: node.value,
            children: [],
        };

        if (isRoot) {
            jmNode.isroot = true;
        }

        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                jmNode.children.push(convertToJsMindFormat(child, false));
            });
        }

        return jmNode;
    }

    // Function to handle the conversion
    function convert() {
        const markdown = markdownInput.value;
        const transformer = new markmap.Transformer();
        const { root } = transformer.transform(markdown);

        const mind = {
            meta: {
                name: 'jsMind - Markmap',
                author: 'Jules',
                version: '0.1'
            },
            format: 'node_tree',
            data: convertToJsMindFormat(root)
        };

        const options = {
            container: 'jsmind_container',
            editable: true,
            theme: 'primary'
        };

        // Clear previous mind map if it exists
        if (jm) {
            jm.show(mind);
        } else {
            jm = new jsMind(options);
            jm.show(mind);
        }
    }

    convertBtn.addEventListener('click', convert);

    const downloadBtn = document.getElementById('download-btn');

    // Function to handle the download
    function download() {
        if (!jm) {
            alert('Please convert a mind map first.');
            return;
        }

        const mindData = jm.get_data('node_tree');
        const mindmapHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>My Mind Map</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/jsmind@0.8.7/style/jsmind.css">
    <style>
        ${document.getElementById('custom-style').innerHTML}
    </style>
</head>
<body>
    <div id="jsmind_container"></div>
    <script src="https://cdn.jsdelivr.net/npm/jsmind@0.8.7/js-legacy/jsmind.js"></script>
    <script>
        const mind = {
            meta: {
                name: 'My Mind Map',
                author: 'Jules',
                version: '0.1'
            },
            format: 'node_tree',
            data: ${JSON.stringify(mindData.data)}
        };

        const options = {
            container: 'jsmind_container',
            editable: false,
            theme: 'primary'
        };

        const jm = new jsMind(options);
        jm.show(mind);
    </script>
</body>
</html>
        `;

        const blob = new Blob([mindmapHtml.trim()], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mindmap.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    downloadBtn.addEventListener('click', download);

    // Initial conversion on page load
    convert();
});
