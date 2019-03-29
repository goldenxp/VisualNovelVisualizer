var g;          // Dagre Graphing system
var render;     // Dagre D3 rendering system 
var svg;        // SVG object in html
var svgi;       // Inner group inside SVG object
var editor;     // Ace editor where story lives

function init()
{
    g = new dagreD3.graphlib.Graph().setGraph({});
    g.setDefaultEdgeLabel(function() { return {}; });
    render = new dagreD3.render();
    
    svg = d3.select("svg"),
    svgi = svg.select("g");
    
    editor = ace.edit("editor");
    editor.session.setMode("ace/mode/asciidoc");
    editor.setShowPrintMargin(false);
    editor.session.on("change", debounce(on_change, 1000));
    // Add some sample text
    editor.session.setValue("label once-upon-a-time:\n\tjump happily-ever-after\nlabel happily-ever-after:\n\tcurtains()");
    
    // Trigger first update
    on_change();
    
    // zooming functionality by transforming inner group
    // TODO mpdify zoom to support level-of-detail of visualization 
    var zoom = d3.zoom().on("zoom", function() { svgi.attr("transform", d3.event.transform); });
    svg.call(zoom);
}

function on_change()
{
    var lines = editor.getSession().doc.getAllLines();
    var currentLabel = "";
    var edges = [];
    var i, l;
    var labelOffset = 6;
    var jumpOffset = 5;
    
    // TODO figure out how to do efficient resets
    
    // Find labels and jumps, link jumps to labels
    for (i = 0, l = lines.length; i < l; i++) 
    {
        var line = lines[i];
        if (line.startsWith("label") && line.endsWith(":"))
        {
            currentLabel = line.substring(line.lastIndexOf("label") + labelOffset, line.lastIndexOf(":"));
            // TODO: add validation here
            g.setNode(currentLabel, {shape: "rect"});
        }
        
        var jumpIndex = line.indexOf("jump");
        if (jumpIndex != -1)
        {
            var jumpLabel = line.substr(jumpIndex + jumpOffset, line.length);
            // TODO: add validation here
            edges.push( { first:currentLabel, second:jumpLabel } );
        }
    }
    
    // Build edges from labels
    for (i = 0, l = edges.length; i < l; i++)
    {
        var edge = edges[i];
        g.setEdge(edge.first, edge.second);
    }
    
    // Trigger render with current graph
    svgi.call(render, g);
}