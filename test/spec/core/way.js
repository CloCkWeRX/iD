describe('iD.Way', function() {
    if (iD.debug) {
        it("freezes nodes", function () {
            expect(Object.isFrozen(iD.Way().nodes)).to.be.true;
        });
    }

    it("returns a way", function () {
        expect(iD.Way()).to.be.an.instanceOf(iD.Way);
        expect(iD.Way().type).to.equal("way");
    });

    it("defaults nodes to an empty array", function () {
        expect(iD.Way().nodes).to.eql([]);
    });

    it("sets nodes as specified", function () {
        expect(iD.Way({nodes: ["n-1"]}).nodes).to.eql(["n-1"]);
    });

    it("defaults tags to an empty object", function () {
        expect(iD.Way().tags).to.eql({});
    });

    it("sets tags as specified", function () {
        expect(iD.Way({tags: {foo: 'bar'}}).tags).to.eql({foo: 'bar'});
    });

    describe("#first", function () {
        it("returns the first node", function () {
            expect(iD.Way({nodes: ['a', 'b', 'c']}).first()).to.equal('a');
        });
    });

    describe("#last", function () {
        it("returns the last node", function () {
            expect(iD.Way({nodes: ['a', 'b', 'c']}).last()).to.equal('c');
        });
    });

    describe("#contains", function () {
        it("returns true if the way contains the given node", function () {
            expect(iD.Way({nodes: ['a', 'b', 'c']}).contains('b')).to.be.true;
        });

        it("returns false if the way does not contain the given node", function () {
            expect(iD.Way({nodes: ['a', 'b', 'c']}).contains('d')).to.be.false;
        });
    });

    describe("#affix", function () {
        it("returns 'prefix' if the way starts with the given node", function () {
            expect(iD.Way({nodes: ['a', 'b', 'c']}).affix('a')).to.equal('prefix');
        });

        it("returns 'suffix' if the way ends with the given node", function () {
            expect(iD.Way({nodes: ['a', 'b', 'c']}).affix('c')).to.equal('suffix');
        });

        it("returns falsy if the way does not start or end with the given node", function () {
            expect(iD.Way({nodes: ['a', 'b', 'c']}).affix('b')).not.to.be.ok;
            expect(iD.Way({nodes: []}).affix('b')).not.to.be.ok;
        });
    });

    describe("#extent", function () {
        it("returns the minimal extent containing all member nodes", function () {
            var node1 = iD.Node({loc: [0, 0]}),
                node2 = iD.Node({loc: [5, 10]}),
                way   = iD.Way({nodes: [node1.id, node2.id]}),
                graph = iD.Graph([node1, node2, way]);
            expect(way.extent(graph)).to.eql([[0, 0], [5, 10]]);
        });
    });

    describe('#isClosed', function() {
        it('returns false when the way has no nodes', function() {
            expect(iD.Way().isClosed()).to.equal(false);
        });

        it('returns false when the way ends are not equal', function() {
            expect(iD.Way({nodes: ['n1', 'n2']}).isClosed()).to.equal(false);
        });

        it('returns true when the way ends are equal', function() {
            expect(iD.Way({nodes: ['n1', 'n2', 'n1']}).isClosed()).to.equal(true);
        });
    });

    describe('#isOneWay', function() {
        it('returns false when the way has no tags', function() {
            expect(iD.Way().isOneWay()).to.eql(false);
        });

        it('returns false when the way has tag oneway=no', function() {
            expect(iD.Way({tags: { oneway: 'no' }}).isOneWay()).to.equal(false);
        });

        it('returns true when the way has tag oneway=yes', function() {
            expect(iD.Way({tags: { oneway: 'yes' }}).isOneWay()).to.equal(true);
        });

        it('returns true when the way has tag waterway=river or waterway=stream', function() {
            expect(iD.Way({tags: { waterway: 'river' }}).isOneWay()).to.equal(true);
            expect(iD.Way({tags: { waterway: 'stream' }}).isOneWay()).to.equal(true);
        });

        it('returns true when the way has tag junction=roundabout', function() {
            expect(iD.Way({tags: { junction: 'roundabout' }}).isOneWay()).to.equal(true);
        });
    });

    describe('#isArea', function() {
        it('returns false when the way has no tags', function() {
            expect(iD.Way().isArea()).to.equal(false);
        });

        it('returns true if the way has tag area=yes', function() {
            expect(iD.Way({tags: { area: 'yes' }}).isArea()).to.equal(true);
        });

        it('returns false if the way is closed and has no tags', function() {
            expect(iD.Way({nodes: ['n1', 'n1']}).isArea()).to.equal(false);
        });

        it('returns true if the way is closed and has a key in iD.areaKeys', function() {
            expect(iD.Way({nodes: ['n1', 'n1'], tags: {building: 'yes'}}).isArea()).to.equal(true);
        });

        it('returns false if the way is closed and has no keys in iD.areaKeys', function() {
            expect(iD.Way({nodes: ['n1', 'n1'], tags: {a: 'b'}}).isArea()).to.equal(false);
        });

        it('returns false if the way is closed and has tag area=no', function() {
            expect(iD.Way({nodes: ['n1', 'n1'], tags: {area: 'no', building: 'yes'}}).isArea()).to.equal(false);
        });

        it('returns false for coastline', function() {
            expect(iD.Way({nodes: ['n1', 'n1'], tags: {natural: 'coastline'}}).isArea()).to.equal(false);
        });
    });

    describe("#isDegenerate", function() {
       it("returns true for a linear way with zero or one nodes", function () {
           expect(iD.Way({nodes: []}).isDegenerate()).to.equal(true);
           expect(iD.Way({nodes: ['a']}).isDegenerate()).to.equal(true);
       });

        it("returns true for a circular way with only one unique node", function () {
            expect(iD.Way({nodes: ['a', 'a']}).isDegenerate()).to.equal(true);
        });

        it("returns false for a linear way with two or more nodes", function () {
            expect(iD.Way({nodes: ['a', 'b']}).isDegenerate()).to.equal(false);
        });

        it("returns true for an area with zero, one, or two unique nodes", function () {
            expect(iD.Way({tags: {area: 'yes'}, nodes: []}).isDegenerate()).to.equal(true);
            expect(iD.Way({tags: {area: 'yes'}, nodes: ['a', 'a']}).isDegenerate()).to.equal(true);
            expect(iD.Way({tags: {area: 'yes'}, nodes: ['a', 'b', 'a']}).isDegenerate()).to.equal(true);
        });

        it("returns false for an area with three or more unique nodes", function () {
            expect(iD.Way({tags: {area: 'yes'}, nodes: ['a', 'b', 'c', 'a']}).isDegenerate()).to.equal(false);
        });
    });

    describe("#areAdjacent", function() {
        it("returns false for nodes not in the way", function() {
            expect(iD.Way().areAdjacent('a', 'b')).to.equal(false);
        });

        it("returns false for non-adjacent nodes in the way", function() {
            expect(iD.Way({nodes: ['a', 'b', 'c']}).areAdjacent('a', 'c')).to.equal(false);
        });

        it("returns true for adjacent nodes in the way (forward)", function() {
            var way = iD.Way({nodes: ['a', 'b', 'c', 'd']});
            expect(way.areAdjacent('a', 'b')).to.equal(true);
            expect(way.areAdjacent('b', 'c')).to.equal(true);
            expect(way.areAdjacent('c', 'd')).to.equal(true);
        });

        it("returns true for adjacent nodes in the way (reverse)", function() {
            var way = iD.Way({nodes: ['a', 'b', 'c', 'd']});
            expect(way.areAdjacent('b', 'a')).to.equal(true);
            expect(way.areAdjacent('c', 'b')).to.equal(true);
            expect(way.areAdjacent('d', 'c')).to.equal(true);
        });
    });

    describe("#geometry", function() {
        it("returns 'line' when the way is not an area", function () {
            expect(iD.Way().geometry(iD.Graph())).to.equal('line');
        });

        it("returns 'area' when the way is an area", function () {
            expect(iD.Way({tags: { area: 'yes' }}).geometry(iD.Graph())).to.equal('area');
        });
    });

    describe("#addNode", function () {
        it("adds a node to the end of a way", function () {
            var w = iD.Way();
            expect(w.addNode('a').nodes).to.eql(['a']);
        });

        it("adds a node to a way at index 0", function () {
            var w = iD.Way({nodes: ['a', 'b']});
            expect(w.addNode('c', 0).nodes).to.eql(['c', 'a', 'b']);
        });

        it("adds a node to a way at a positive index", function () {
            var w = iD.Way({nodes: ['a', 'b']});
            expect(w.addNode('c', 1).nodes).to.eql(['a', 'c', 'b']);
        });

        it("adds a node to a way at a negative index", function () {
            var w = iD.Way({nodes: ['a', 'b']});
            expect(w.addNode('c', -1).nodes).to.eql(['a', 'c', 'b']);
        });
    });

    describe("#updateNode", function () {
        it("updates the node id at the specified index", function () {
            var w = iD.Way({nodes: ['a', 'b', 'c']});
            expect(w.updateNode('d', 1).nodes).to.eql(['a', 'd', 'c']);
        });
    });

    describe("#removeNode", function () {
        it("removes the node", function () {
            var a = iD.Node({id: 'a'}),
                w = iD.Way({nodes: ['a']});

            expect(w.removeNode('a').nodes).to.eql([]);
        });

        it("prevents duplicate consecutive nodes", function () {
            var a = iD.Node({id: 'a'}),
                b = iD.Node({id: 'b'}),
                c = iD.Node({id: 'c'}),
                w = iD.Way({nodes: ['a', 'b', 'c', 'b']});

            expect(w.removeNode('c').nodes).to.eql(['a', 'b']);
        });

        it("preserves circularity", function () {
            var a = iD.Node({id: 'a'}),
                b = iD.Node({id: 'b'}),
                c = iD.Node({id: 'c'}),
                d = iD.Node({id: 'd'}),
                w = iD.Way({nodes: ['a', 'b', 'c', 'd', 'a']});

            expect(w.removeNode('a').nodes).to.eql(['b', 'c', 'd', 'b']);
        });

        it("prevents duplicate consecutive nodes when preserving circularity", function () {
            var a = iD.Node({id: 'a'}),
                b = iD.Node({id: 'b'}),
                c = iD.Node({id: 'c'}),
                d = iD.Node({id: 'd'}),
                w = iD.Way({nodes: ['a', 'b', 'c', 'd', 'b', 'a']});

            expect(w.removeNode('a').nodes).to.eql(['b', 'c', 'd', 'b']);
        });
    });

    describe("#asJXON", function () {
        it('converts a way to jxon', function() {
            var node = iD.Way({id: 'w-1', nodes: ['n1', 'n2'], tags: {highway: 'residential'}});
            expect(node.asJXON()).to.eql({way: {
                '@id': '-1',
                '@version': 0,
                nd: [{keyAttributes: {ref: '1'}}, {keyAttributes: {ref: '2'}}],
                tag: [{keyAttributes: {k: 'highway', v: 'residential'}}]}});
        });

        it('includes changeset if provided', function() {
            expect(iD.Way().asJXON('1234').way['@changeset']).to.equal('1234');
        });
    });

    describe("#asGeoJSON", function () {
        it("converts a line to a GeoJSON LineString geometry", function () {
            var a = iD.Node({loc: [1, 2]}),
                b = iD.Node({loc: [3, 4]}),
                w = iD.Way({tags: {highway: 'residential'}, nodes: [a.id, b.id]}),
                graph = iD.Graph([a, b, w]),
                json = w.asGeoJSON(graph);

            expect(json.type).to.equal('LineString');
            expect(json.coordinates).to.eql([a.loc, b.loc]);
        });

        it("converts an area to a GeoJSON Polygon geometry", function () {
            var a = iD.Node({loc: [1, 2]}),
                b = iD.Node({loc: [5, 6]}),
                c = iD.Node({loc: [3, 4]}),
                w = iD.Way({tags: {area: 'yes'}, nodes: [a.id, b.id, c.id, a.id]}),
                graph = iD.Graph([a, b, c, w]),
                json = w.asGeoJSON(graph, true);

            expect(json.type).to.equal('Polygon');
            expect(json.coordinates).to.eql([[a.loc, b.loc, c.loc, a.loc]]);
        });

        it("converts an unclosed area to a GeoJSON LineString geometry", function () {
            var a = iD.Node({loc: [1, 2]}),
                b = iD.Node({loc: [5, 6]}),
                c = iD.Node({loc: [3, 4]}),
                w = iD.Way({tags: {area: 'yes'}, nodes: [a.id, b.id, c.id]}),
                graph = iD.Graph([a, b, c, w]),
                json = w.asGeoJSON(graph, true);

            expect(json.type).to.equal('LineString');
            expect(json.coordinates).to.eql([a.loc, b.loc, c.loc]);
        });
    });

    describe("#area", function() {
        it("returns a relative measure of area", function () {
            var graph = iD.Graph([
                iD.Node({id: 'a', loc: [-0.0002,  0.0001]}),
                iD.Node({id: 'b', loc: [ 0.0002,  0.0001]}),
                iD.Node({id: 'c', loc: [ 0.0002, -0.0001]}),
                iD.Node({id: 'd', loc: [-0.0002, -0.0001]}),
                iD.Node({id: 'e', loc: [-0.0004,  0.0002]}),
                iD.Node({id: 'f', loc: [ 0.0004,  0.0002]}),
                iD.Node({id: 'g', loc: [ 0.0004, -0.0002]}),
                iD.Node({id: 'h', loc: [-0.0004, -0.0002]}),
                iD.Way({id: 's', tags: {area: 'yes'}, nodes: ['a', 'b', 'c', 'd', 'a']}),
                iD.Way({id: 'l', tags: {area: 'yes'}, nodes: ['e', 'f', 'g', 'h', 'e']})
            ]);

            var s = Math.abs(graph.entity('s').area(graph)),
                l = Math.abs(graph.entity('l').area(graph));

            expect(s).to.be.lt(l);
        });

        it("returns 0 for degenerate areas", function () {
            var graph = iD.Graph([
                iD.Node({id: 'a', loc: [-0.0002,  0.0001]}),
                iD.Node({id: 'b', loc: [ 0.0002,  0.0001]}),
                iD.Way({id: '0', tags: {area: 'yes'}, nodes: []}),
                iD.Way({id: '1', tags: {area: 'yes'}, nodes: ['a']}),
                iD.Way({id: '2', tags: {area: 'yes'}, nodes: ['a', 'b']})
            ]);

            expect(graph.entity('0').area(graph)).to.equal(0);
            expect(graph.entity('1').area(graph)).to.equal(0);
            expect(graph.entity('2').area(graph)).to.equal(0);
        });
    });
});
