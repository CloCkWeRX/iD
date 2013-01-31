iD.modes.AddArea = function(context) {
    var mode = {
        id: 'add-area',
        button: 'area',
        title: t('modes.add_area.title'),
        description: t('modes.add_area.description'),
        key: t('modes.add_area.key')
    };

    var behavior,
        defaultTags = {area: 'yes'};

    mode.enter = function() {
        function start(loc) {
            var graph = context.graph(),
                node = iD.Node({loc: loc}),
                way = iD.Way({tags: defaultTags});

            context.perform(
                iD.actions.AddEntity(node),
                iD.actions.AddEntity(way),
                iD.actions.AddVertex(way.id, node.id),
                iD.actions.AddVertex(way.id, node.id));

            context.enter(iD.modes.DrawArea(context, way.id, graph));
        }

        function startFromWay(other, loc, index) {
            var graph = context.graph(),
                node = iD.Node({loc: loc}),
                way = iD.Way({tags: defaultTags});

            context.perform(
                iD.actions.AddEntity(node),
                iD.actions.AddEntity(way),
                iD.actions.AddVertex(way.id, node.id),
                iD.actions.AddVertex(way.id, node.id),
                iD.actions.AddVertex(other.id, node.id, index));

            context.enter(iD.modes.DrawArea(context, way.id, graph));
        }

        function startFromNode(node) {
            var graph = context.graph(),
                way = iD.Way({tags: defaultTags});

            context.perform(
                iD.actions.AddEntity(way),
                iD.actions.AddVertex(way.id, node.id),
                iD.actions.AddVertex(way.id, node.id));

            context.enter(iD.modes.DrawArea(context, way.id, graph));
        }

        function startFromMidpoint(midpoint) {
            var graph = context.graph(),
                node = iD.Node(),
                way = iD.Way({tags: defaultTags});

            context.perform(
                iD.actions.AddMidpoint(midpoint, node),
                iD.actions.AddEntity(way),
                iD.actions.AddVertex(way.id, node.id),
                iD.actions.AddVertex(way.id, node.id));

            context.enter(iD.modes.DrawArea(context, way.id, graph));
        }

        behavior = iD.behavior.AddWay(context)
            .on('start', start)
            .on('startFromWay', startFromWay)
            .on('startFromNode', startFromNode)
            .on('startFromMidpoint', startFromMidpoint);

        context.install(behavior);
        context.tail(t('modes.add_area.tail'));
    };

    mode.exit = function() {
        context.uninstall(behavior);
    };

    return mode;
};
