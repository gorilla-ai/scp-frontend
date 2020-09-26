//
//     Copyright © 2011-2020 Cambridge Intelligence Limited.
//     All rights reserved.
//     KeyLines v5.10.2-53142
//

export as namespace KeyLines;

declare namespace KeyLines {
  export interface IdMap<T> {
    [id: string]: T;
  }

  export interface ChartData {
    /** The KeyLines chart data format. */
    type: 'LinkChart';
    /** An array of nodes and links. */
    items: (Node | Link | Shape)[];
  }

  export interface NodeStyle {
    /** The border colour. Default: No border. */
    b?: string;
    /** Whether the node is displayed in the background. Default: false. */
    bg?: boolean;
    /** The style of the border line. Default: 'solid'. */
    bs?: 'solid' | 'dashed';
    /** An object describing the bubble shown on the node. */
    bu?: Bubble;
    /** The width of the node's border. Default: 4. */
    bw?: number;
    /** The fill colour. Default: No fill. */
    c?: string;
    /** Whether the image should be a cutout circle from the original image. Does not apply to font icons. Default: false. */
    ci?: boolean;
    /** The 'd' parameter stands for data. Use this to store custom data on the node. */
    d?: any;
    /** An object describing the donut border shown on the node. Only applies to nodes with 'circle' shape. If both donut and b are set then donut takes precedence. */
    donut?: Donut;
    /** **DEPRECATED** Whether this is a dummy node. Dummy nodes are drawn as the ends of a dumbbell, for links which typically have just been created by dragging onto the chart surface. Default: false. */
    du?: boolean;
    /** The enlargement factor for the node. Default: 1. */
    e?: number;
    /** Whether the label should be displayed in bold font. Default: false. */
    fb?: boolean;
    /** The background colour of the font. The default is a subtle effect using white with an alpha channel. */
    fbc?: string;
    /** The colour for the label font. Default: black. */
    fc?: string;
    /** The font family to use for the label. The default is inherited from the chart.options() `fontFamily` setting. */
    ff?: string;
    /** The font icon used on the node. */
    fi?: FontIcon | null;
    /** The font size (pt) of the node label. By default the font size will scale with the node's e property. */
    fs?: number;
    /** An array of objects describing the glyphs shown on the node. */
    g?: Glyph[];
    /** The halos shown on the node. There are ten halo properties, ha0, ha1, ha2, etc., up to ha9. */
    ha0?: Halo;
    /** The halos shown on the node. There are ten halo properties, ha0, ha1, ha2, etc., up to ha9. */
    ha1?: Halo;
    /** The halos shown on the node. There are ten halo properties, ha0, ha1, ha2, etc., up to ha9. */
    ha2?: Halo;
    /** The halos shown on the node. There are ten halo properties, ha0, ha1, ha2, etc., up to ha9. */
    ha3?: Halo;
    /** The halos shown on the node. There are ten halo properties, ha0, ha1, ha2, etc., up to ha9. */
    ha4?: Halo;
    /** The halos shown on the node. There are ten halo properties, ha0, ha1, ha2, etc., up to ha9. */
    ha5?: Halo;
    /** The halos shown on the node. There are ten halo properties, ha0, ha1, ha2, etc., up to ha9. */
    ha6?: Halo;
    /** The halos shown on the node. There are ten halo properties, ha0, ha1, ha2, etc., up to ha9. */
    ha7?: Halo;
    /** The halos shown on the node. There are ten halo properties, ha0, ha1, ha2, etc., up to ha9. */
    ha8?: Halo;
    /** The halos shown on the node. There are ten halo properties, ha0, ha1, ha2, etc., up to ha9. */
    ha9?: Halo;
    /** Whether the node is hidden. Default: false. */
    hi?: boolean;
    /** The style of a combo when open. */
    oc?: OpenStyleOptions;
    /** The id of the parent node, if it is a member of a combo. Can be set explicitly during combo creation; after that you should use `chart.combo().transfer()` to change it. */
    parentId?: string | null;
    /** An object describing the position of the node on the map when in map mode. */
    pos?: Location;
    /** The node's shape. Default: 'circle'. */
    sh?: 'box' | 'circle';
    /** The node label. Use new lines for multiline labels. Default: No label. */
    t?: string;
    /** If true, the label is shown in the centre of the node. If false, then the label is shown at the bottom of the node. Default: false for nodes with images, true for other nodes. */
    tc?: boolean;
    /** The type of the item. */
    type?: 'node';
    /** The URL of the node image. */
    u?: string;
    /** The node position along the X-axis, in world coordinates. Default: 0. */
    x?: number;
    /** The node position along the Y-axis, in world coordinates. Default: 0. */
    y?: number;
  }

  export interface OpenStyleOptions {
    /** The colour of the open combo's border. Default: grey. */
    b?: string;
    /** The style of the border line. Default: solid. */
    bs?: 'solid' | 'dashed';
    /** The width of the open combo's border. Default: 1. */
    bw?: number;
    /** The colour of the open combo. Default: light grey. */
    c?: string;
    /** Whether resize handles are shown. Default: false. */
    re?: boolean;
    /** The width of the open combo. When the combo is created, this is set to fit all child nodes. */
    w?: number;
  }

  export interface NodeProperties extends NodeStyle {
    /** The identity of the node. Must be unique across all items in the chart. Must not start with an underscore or end with a '\' character. */
    id: string;
  }

  export interface Node extends NodeProperties {
    /** The type of the item. */
    type: 'node';
  }

  export interface LinkStyle {
    /** Whether to show an arrow at the id1 end. Default: false. */
    a1?: boolean;
    /** Whether to show an arrow at the id2 end. Default: false. */
    a2?: boolean;
    /** The distance to back-off from end id1 as a ratio of the total length of the link line. Value in the range 0 to 1. Default: 0. */
    b1?: number;
    /** The distance to back-off from end id2 as a ratio of the total length of the link line. Value in the range 0 to 1. Default: 0. */
    b2?: number;
    /** Whether the link is displayed in the background. Default: false. */
    bg?: boolean;
    /** An object describing the bubble shown on the link. */
    bu?: Bubble;
    /** The colour of the link line. Default: grey. */
    c?: string;
    /** If specified, the link will have a colour gradient, with colour c at the id1 end and colour c2 at the id2 end. The linkStyle transition setting controls the gradient's appearance. */
    c2?: string;
    /** The 'd' parameter stands for data. Use this to store custom data on the link. */
    d?: any;
    /** Whether the label should be displayed in bold font. Default: false. */
    fb?: boolean;
    /** The background colour of the font. The default is a subtle effect using white with an alpha channel. */
    fbc?: string;
    /** The colour for the label font. Default: black. */
    fc?: string;
    /** The font family to use for the label. The default is inherited from the chart.options() `fontFamily` setting. */
    ff?: string;
    /** Options to customise the flow animation on the link. Set to false to disable or true for a default flow. Note that enabling flow overrides the 'ls' property. Default: false. */
    flow?: boolean | FlowOptions;
    /** The font size (pt) of the link label. Default: 14. */
    fs?: number;
    /** An array of objects describing the glyphs shown next to the link label. */
    g?: Glyph[];
    /** Whether the link is hidden. Default: false. */
    hi?: boolean;
    /** The style of the link line. Default: 'solid'. */
    ls?: 'solid' | 'dashed' | 'dotted';
    /** Sets the offset of the midpoint of the link, controlling how curved the link is. A zero offset gives a straight line for links between two different nodes. For self links, sets the offset from the default position close to the node. Increasing the offset value increases the size of the arc. Default: 0. */
    off?: number;
    /** The id of the parent combo or link (if it is a member of a combo). Note that parentIds for links are calculated automatically and cannot be set. */
    parentId?: string | null;
    /** The label positioned at the centre of the link. Use new lines for multiline labels. */
    t?: string;
    /** The link label positioned at the id1 end. Use new lines for multiline labels. String values inherit styling from the label at the link's centre. */
    t1?: string | LinkEndLabel;
    /** The link label positioned at the id2 end. Use new lines for multiline labels. String values inherit styling from the label at the link's centre. */
    t2?: string | LinkEndLabel;
    /** The width of the link line. Also affect the size of arrowheads if present. Default: 1. */
    w?: number;
  }

  export interface LinkEndLabel {
    /** Whether the label should be displayed in bold font. The default is inherited from the link's 'fb' setting. */
    fb?: boolean;
    /** The background colour of the font. The default is inherited from the label at the centre of the link. */
    fbc?: string;
    /** The colour for the label font. The default is inherited from the label at the centre of the link. */
    fc?: string;
    /** The font family to use for the label. The default is inherited from the label at the centre of the link. */
    ff?: string;
    /** The font size (pt) of the link label. The default is inherited from the label at the centre of the link. */
    fs?: number;
    /** An array of objects describing the glyphs shown next to the link label. */
    g?: Glyph[];
    /** The link label. Use new lines for multiline labels. */
    t?: string;
  }

  export interface FlowOptions {
    /** The velocity of the flow on the link. Positive values flow from id1 to id2, and negative from id2 to id1. Must be in the range -10 to 10. Default: 2. */
    velocity?: number;
  }

  export interface LinkProperties extends LinkStyle {
    /** The identity of the link. This must be unique across all items in the chart. It must not end with a '\' character. */
    id: string;
  }

  export interface Link extends LinkProperties {
    /** The identity of the node at one end of the link. */
    id1: string;
    /** The identity of the node at the other end of the link. This may be the same as id1 to create a "self link" if the 'selfLinks' chart option is enabled. */
    id2: string;
    /** The type of the item. */
    type: 'link';
  }

  export interface ShapeStyle {
    /** The border colour. Default: No border. */
    b?: string;
    /** The style of the border line. Default: 'solid'. */
    bs?: 'solid' | 'dashed';
    /** The width of the shape's border. Default: 4. */
    bw?: number;
    /** Whether the shape is displayed in the background. Default: false. */
    bg?: boolean;
    /** An object describing the bubble shown on the shape. */
    bu?: Bubble;
    /** The fill colour. Default: No fill. */
    c?: string;
    /** Whether the image should be a cutout circle from the original image. Does not apply to font icons. Default: false. */
    ci?: boolean;
    /** The 'd' parameter stands for data. Use this to store custom data on the shape. */
    d?: any;
    /** Whether the label should be displayed in bold font. Default: false. */
    fb?: boolean;
    /** The background colour of the font. The default is a subtle effect using white with an alpha channel. */
    fbc?: string;
    /** The colour for the label font. Default: 'black'. */
    fc?: string;
    /** The font family to use for the label. The default is inherited from the chart.options() `fontFamily` setting. */
    ff?: string;
    /** The font icon used on the shape. */
    fi?: FontIcon;
    /** The font size (pt) of the shape label. Default: 14. */
    fs?: number;
    /** An array of objects describing the glyphs shown on the shape. */
    g?: Glyph[];
    /** The height of the shape in world coordinates. Note that setting w and h defines shape nodes. For enlarging nodes, use the `e` property. Default: 0. */
    h?: number;
    /** Whether the shape is hidden. Default: false. */
    hi?: boolean;
    /** The id of the parent node, if it is a member of a combo. Can be set explicitly during combo creation; after that you should use `chart.combo().transfer()` to change it. */
    parentId?: string | null;
    /** The position of the shape on the map when in map mode. */
    pos?: Location;
    /** Whether resize handles should be shown. Default: false. */
    re?: boolean;
    /** The node's shape. Default: 'box'. */
    sh?: 'box' | 'circle';
    /** The shape label. Use new lines for multiline labels. Default: No label. */
    t?: string;
    /** If true, the label is shown in the centre of the shape. If false, the label is shown at the bottom of the shape. Default: false. */
    tc?: boolean;
    /** The type of the item. */
    type: 'node';
    /** The URL of the node image. */
    u?: string;
    /** The width of the shape in world coordinates. Note that setting w and h defines shape nodes. For enlarging nodes, use the `e` property. */
    w?: number;
    /** The node position along the X-axis, in world coordinates. Default: 0. */
    x?: number;
    /** The node position along the Y-axis, in world coordinates. Default: 0. */
    y?: number;
  }

  export interface ShapeProperties extends ShapeStyle {
    /** The identity of this node. This must be unique across all items in the chart. It must not start with an underscore or end with a '\' character. */
    id: string;
  }

  export interface Shape extends ShapeProperties {
    /** The height of the shape in world coordinates. Default: 0. */
    h: number;
    /** The type of the item. */
    type: 'node';
    /** The width of the shape in world coordinates. */
    w: number;
  }

  export interface Bubble {
    /** The colour of the bubble border. Default: grey. */
    b?: string;
    /** The colour of the bubble fill. Default: 'white'. */
    c?: string;
    /** Whether the bubble text should be displayed in bold font. Default: false. */
    fb?: boolean;
    /** The colour for the bubble text font. Default: 'black'. */
    fc?: string;
    /** The font family to use for the bubble text. The default is inherited from the chart.options() `fontFamily` setting. */
    ff?: string;
    /** The font size (pt) of the bubble text. Default: 14. */
    fs?: number;
    /** An object describing the glyph shown in the bubble. */
    g?: Glyph;
    /** The position of the bubble relative to the node or link. The 4 positions are compass points. Default: 'ne'. */
    p?: 'ne' | 'se' | 'sw' | 'nw';
    /** The text for the bubble. */
    t: string;
  }

  export interface Glyph {
    /** Set to true for an animated glyph. Default: false. */
    a?: boolean;
    /** The colour of the glyph border. Default: grey. */
    b?: string;
    /** The colour of the glyph fill. If colour is specified then the image will be shown inside the glyph. If no colour is specified then the image replaces the glyph circle and no label is shown. */
    c?: string;
    /** The enlargement factor for the glyph. Default: 1. */
    e?: number;
    /** Whether the glyph's label should be displayed in bold. Default: true. */
    fb?: boolean;
    /** The font colour for the glyph's label. Default: 'white'. */
    fc?: string;
    /** The font family to use for the glyph's label. The default is inherited from the chart.options() `fontFamily` setting. */
    ff?: string;
    /** The font icon to use as a glyph. */
    fi?: FontIcon;
    /** The position of the glyph relative to the node. Glyph positions are **only supported on nodes**, and are required in order for the glyph to be shown. Use compass points or integer degrees clockwise from the top (in the range 0-359). */
    p?: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' | number;
    /** Overrides the distance from the centre of the node at which the glyph is drawn. Only available when the glyph's position is a number - ignored when position is a compass point. If `r` is specified, link ends will no longer avoid the glyph. */
    r?: number;
    /** The label for the glyph. If a label is specified then it takes precedence over the image. For standard glyphs, with `w` false, a maximum of four characters can be shown. For wide glyphs, with `w` true,
    a maximum of 25 characters can be shown. Longer labels are truncated. */
    t?: string;
    /** The URL of the image to use for the glyph. The image can be any size, but 64X64 should be adequate. */
    u?: string;
    /** Set to true to extend the width of the glyph circle to form a rounded rectangle. Only applies to glyphs on nodes and not to glyphs on links, bubbles or glyph-only nodes. Default: false. */
    w?: boolean;
  }

  export interface FontIcon {
    /** The colour of the font icon fill. Default: 'black'. */
    c?: string;
    /** The font family to use for the font icon. The default is inherited from the chart.options() `iconFontFamily` setting. */
    ff?: string;
    /** The font icon to show. If the content is a string then it will be shown directly. Otherwise the value will be used to find the appropriate font icon within the UNICODE space. */
    t: string | number;
  }

  export interface Halo {
    /** The colour of the halo. */
    c: string;
    /** The radius of the halo. */
    r: number;
    /** The width of the halo. */
    w: number;
  }

  export interface Donut {
    /** The colour of the border between donut segments. Default: 'white'. */
    b?: string;
    /** The width of the border between donut segments. Default: 2. */
    bw?: number;
    /** An array giving the colour of each segment. It should contain the same number of elements as the v array. If not supplied, a default set of colours is used. Default: standard colours. */
    c?: string[];
    /** An array giving the size of each segment. Values must be positive. Segments are positioned clockwise around the node starting at the top. Do not animate changes that add or remove segments. */
    v: number[];
    /** The width of the donut segments. This doesn't include the border. Default: 10. */
    w?: number;
  }

  export interface Location {
    /** The latitude in degrees that this node is positioned at when in map mode. Should be in the range -90 to 90, but larger values will be rounded to ±90 respectively */
    lat: number;
    /** The longitude in degrees that this node is positioned at when in map mode. Should be in the range -180 to 180 but larger values will wrap at the antimeridian. */
    lng: number;
  }

  export interface TimeBarData {
    /** The KeyLines time bar data format. */
    items: TimeBarItem[];
  }

  export interface TimeBarItem {
    /** The time entry or time entries associated with this item. Numbers are evaluated as milliseconds. */
    dt: Date | number | TimePeriod | (Date | number | TimePeriod)[];
    /** The id that the item is associated with. It must not end with a '\' character. */
    id: string;
    /** The value associated with each time entry, for example, the amount of a transaction.
    Values must be greater than zero. The same number of values should be supplied as the number of time entries. If values are not supplied, then the time bar counts the number of timestamps, instead of adding up the corresponding values. Default: 1. */
    v?: number | number[];
  }

  export interface TimePeriod {
    /** The timestamp for the start of the time period, with numbers evaluated as milliseconds. */
    dt1?: Date | number;
    /** The timestamp for the end of the time period, with numbers evaluated as milliseconds. */
    dt2?: Date | number;
  }

  export interface AnimatePropertiesOptions {
    /** The time the animation should take, in milliseconds. Default: 1000. */
    time?: number;
    /** The easing function to use: 'linear': Speed is constant during animation. 'cubic': Animation starts slow, speeds up, then finishes slow. Default: 'linear'. */
    easing?: 'linear' | 'cubic';
    /** If true, the animation is queued until all previous queued animations have completed. If false, the animation begins immediately. Default: true. */
    queue?: boolean;
  }

  export interface ArrangeOptions {
    /** Whether the result should be animated. Default: true. */
    animate?: boolean;
    /** Whether to fit the chart into the window at the end of the arrangement. Default: false. */
    fit?: boolean;
    /** Controls the position of the group of arranged nodes. Default: 'average'. */
    position?: 'absolute' | 'average' | 'tidy';
    /** Controls how close nodes are to each other, with higher values being closer. Must be in the range 0 to 10. Default: 5. */
    tightness?: number;
    /** If animated, the time the animation should take, in milliseconds. Default: 700. */
    time?: number;
    /** When `position` is set to 'absolute', the x coordinate of the centre of the nodes. Default: 0. */
    x?: number;
    /** When `position` is set to 'absolute', the y coordinate of the centre of the nodes. Default: 0. */
    y?: number;
  }

  export interface ShapeOptions {
    /** The height of the shape. */
    h: number;
    /** The type of shape. Default: 'box'. */
    sh?: 'box' | 'circle';
    /** The width of the shape. */
    w: number;
    /** The centre of the shape along the X-axis. */
    x: number;
    /** The centre of the shape along the Y-axis. */
    y: number;
  }

  export interface CreateLinkOptions {
    /** An object describing the style of the new link. Any optional LinkStyle properties except `off` can be passed (i.e., all except for `id`, `id1`, `id2`, `type` and `off`). */
    style?: LinkStyle;
  }

  export interface EachOptions {
    /** The type of items to consider. Default: 'all'. */
    type?: 'node' | 'link' | 'all';
    /** The chart items to iterate over when using combos. 'underlying': iterates over items that are not combo nodes or combo links. 'toplevel': iterates over items, including combos, that are not inside other combos. 'all': iterates over every item. Default: 'underlying'. */
    items?: 'underlying' | 'toplevel' | 'all';
  }

  type ExpandLayoutName = 'standard' | 'organic' | 'hierarchy' | 'sequential' | 'lens' | 'radial' | 'tweak';

  export interface ExpandLayoutOptions {
    /** The name of the layout to apply. By default it applies the 'standard' layout, but without performing the fit chart to window and tidy options. */
    name?: ExpandLayoutName;
    /** Specifies which nodes should be fixed in position when the layout is run. Does not apply to 'tweak' and 'lens' layouts. Default: 'nonadjacent'. */
    fix?: 'all' | 'none' | 'adaptive' | 'adjacent' | 'nonadjacent';
    /** If set to true, each layout run will produce the same chart display for the same chart structure. If false, the layout will produce different results for a given network on each run. Only used by 'lens', 'organic' and 'standard'. Default: false. */
    consistent?: boolean;
    /** The easing function to use: 'linear': Speed is constant during animation. 'cubic': Animation starts slow, speeds up, then finishes slow. Default: 'cubic'. */
    easing?: 'linear' | 'cubic';
    /** Whether to fit the chart into the window at the end of the layout. Default: false. */
    fit?: boolean;
    /** Only applies to 'hierarchy'. If true, the hierarchy will be flattened by removing extra space between levels. Default: false. */
    flatten?: boolean;
    /** The name of the custom property that defines which level a node belongs to in the 'sequential', 'radial' and 'hierarchy' layouts.
    Lower node level values are placed higher in the hierarchy. Levels for nodes with no level data are inferred from the nodes' links.
    Required for the 'radial' and 'hierarchy' layouts, unless the `top` option is specified. */
    level?: string;
    /** The orientation of the hierarchy layout. Default: 'down'. */
    orientation?: 'down' | 'right' | 'up' | 'left';
    /** The spacing between nodes at each level of the sequential layout. Default: 'auto'. */
    spacing?: 'auto' | 'equal' | 'stretched';
    /** If true, curved links are straightened. If false, they remain curved. Default: true. */
    straighten?: boolean;
    /** The spacing between levels in a sequential layout. Values must be positive. Default: 1. */
    stretch?: number;
    /** Lets you choose an alternative packing mode to use for the organic layout during expand. Default: 'rectangle'. */
    packing?: 'adaptive' | 'circle' | 'rectangle';
    /** The tidy option pushes apart the components of the chart so they don't overlap. Not used by 'lens'. Default: false. */
    tidy?: boolean;
    /** Controls how close nodes are to each other, with higher values being closer. Must be in the range 0 to 10. Default: 5. */
    tightness?: number;
    /** The node id/s which should be at the top of the hierarchy/centre of the radial layout.
    Required for the 'hierarchy' and 'radial' layouts, unless the level option is specified. If both 'level' and 'top' are specified, 'top' is ignored. */
    top?: string | string[];
  }

  export interface ExpandArrange {
    /** Controls how nodes are arranged inside an open combo. 'lens' - items are arranged automatically with connected nodes next to each other.
    'concentric' - items are arranged inside a circle with larger items at the centre.
    'none' - items are kept in their original positions. Default: 'lens'. */
    name?: 'concentric' | 'lens' | 'none';
    /** If true, any combos that are arranged will be resized to fit their contents. If false, they will not be resized, unless the contents are beyond the current boundary. Default: true. */
    resize?: boolean;
  }

  export interface ExpandFilter {
    /** A function which takes an item as its argument, returning true if the item should be visible, false otherwise. */
    filterFn?: FilterFn;
    /** The chart items to iterate over when using combos. 'underlying': iterates over items that are not combo nodes or combo links.
    'toplevel': iterates over items, including combos, that are not inside other combos. Default: 'underlying'. */
    items: 'underlying' | 'toplevel';
    /** Whether isolated nodes should be hidden, even if the filter function returns true for them. The default is true if type is 'link', false otherwise. */
    hideSingletons?: boolean;
    /** The type of item to show or hide. Default: 'all'. */
    type?: 'node' | 'link' | 'all';
    /** When true, if items are 'underlying', updates combo nodes' glyph text to equal the number of nodes that are visible inside the combo node. Default: true. */
    updateGlyph?: boolean;
  }

  export interface ExpandOptions {
    /** Whether the result should be animated. Default: true. */
    animate?: boolean;
    /** The time the animation should take, in milliseconds. Default: 1000. */
    time?: number;
    /** An object specifying the layout to apply to the incoming items if there has been a change to the top-level structure of the chart. */
    layout?: ExpandLayoutOptions;
    /** An object specifying how the contents of any combos which have changed should be arranged. */
    arrange?: ExpandArrange;
    /** An object with the filter definition to apply to the chart items before running the layout. This object can have any option passed to the `chart.filter()` function except animate and time, plus an additional one: filterFn. */
    filter?: ExpandFilter;
  }

  export interface ComboNodeFilterResult {
    /** The id of the combo that has been updated. */
    id: string;
    /** The visible node items inside of this combo. */
    nodes?: Node[];
    /** The visible link items inside of this combo. */
    links?: Link[];
  }

  export interface ComboLinkFilterResult {
    /** The id of the combo that has been updated. */
    id: string;
    /** The visible link items inside of this combo. */
    links?: Link[];
  }

  export interface FilterResult {
    /** The items that were shown by the filter function. */
    shown: {
      /** Node ids shown by the filter function. */
      nodes: string[];
      /** Link ids shown by the filter function. */
      links: string[];
    };
    /** The items that were hidden by the filter function. */
    hidden: {
      /** Node ids hidden by the filter function. */
      nodes: string[];
      /** Link ids hidden by the filter function. */
      links: string[];
    };
    /** List the combos that have been updated. */
    combos: {
      /** Combo nodes updated by the filter. */
      nodes: ComboNodeFilterResult[];
      /** Combo links updated by the filter. */
      links: ComboLinkFilterResult[];
    };
  }

  export interface FilterOptions {
    /** Whether the filtering operation should be animated. Default: true. */
    animate?: boolean;
    /** Whether isolated nodes should be hidden, even if the filter function returns true for them. The default is true if type is 'link', false otherwise. */
    hideSingletons?: boolean;
    /** The time the animation should take, in milliseconds. Default: 1000. */
    time?: number;
    /** The type of item to show or hide. Default: 'all'. */
    type?: 'node' | 'link' | 'all';
    /** The chart items to iterate over when using combos. 'underlying': iterates over items that are not combo nodes or combo links.
    'toplevel': iterates over items, including combos, that are not inside other combos. Default: 'underlying'. */
    items?: 'underlying' | 'toplevel';
    /** When true, if items is 'underlying', update combo nodes' glyph text to equal the number of nodes that are visible inside the combo node. Default: true. */
    updateGlyph?: boolean;
  }

  export interface ForegroundResult {
    /** The items that were foregrounded by the foreground function. */
    foreground: {
      /** Node ids foregrounded by the foreground function. */
      nodes: string[];
      /** Link ids foregrounded by the foreground function. */
      links: string[];
    };
    /** The items that were backgrounded by the foreground function. */
    background: {
      /** Node ids backgrounded by the foreground function. */
      nodes: string[];
      /** Link ids backgrounded by the foreground function */
      links: string[];
    };
  }

  export interface ForegroundOptions {
    /** The type of item to foreground/background. Default: 'node'. */
    type?: 'node' | 'link' | 'all';
    /** The chart items to iterate over when using combos. 'underlying': iterates over items that are not combo nodes or combo links.
    'toplevel': iterates over items, including combos, that are not inside other combos. Default: 'underlying'. */
    items?: 'underlying' | 'toplevel';
    /** Defines whether an open combo can be put in the foreground. Set to false to put all open combos in the background. Default: true. */
    foregroundOpenCombos?: boolean;
  }

  export interface HideOptions {
    /** Whether the transition should be animated. Default: false. */
    animate?: boolean;
    /** The time the animation should take, in milliseconds. Default: 1000. */
    time?: number;
  }

  export interface LabelPosition {
    /** The view coordinate of the left edge. */
    x1: number;
    /** The view coordinate of the right edge. */
    x2: number;
    /** The view coordinate of the top edge. */
    y1: number;
    /** The view coordinate of the bottom edge. */
    y2: number;
    /** Font Size at current zoom. */
    fs: number;
  }

  export interface LayoutOptions {
    /** Whether the result should be animated. Default: true. */
    animate?: boolean;
    /** If set to true, each layout run will produce the same chart display for the same chart structure. Their position on the chart may change during the layout, but their position in relation to other nodes will remain the same. If false, the layout will produce different results for a given network on each run. Only used by 'lens', 'organic', 'standard' and 'structural'. Default: false. */
    consistent?: boolean;
    /** The easing function to use: 'linear': Speed is constant during animation.'cubic': Animation starts slow, speeds up, then finishes slow. Default: 'cubic'. */
    easing?: 'linear' | 'cubic';
    /** Whether to fit the chart into the window at the end of the layout. Default: true. */
    fit?: boolean;
    /** An array of node ids whose positions are fixed relative to the other nodes in the same component. Their position on the chart may change during the layout, but their position in relation to the component's other nodes will remain the same. Only used by 'organic', 'standard' and 'tweak'. */
    fixed?: string[];
    /** Only used on 'hierarchy' layout. If true, the hierarchy will be flattened by removing extra space between levels. Default: false. */
    flatten?: boolean;
    /** The name of the custom property that defines which level a node belongs to in the 'sequential', 'radial' and 'hierarchy' layouts.
    Lower node level values are placed higher in the hierarchy. Levels for nodes with no level data are inferred from the nodes' links.
    Required for the 'radial' and 'hierarchy' layouts, unless the `top` option is specified. */
    level?: string;
    /** The orientation of the hierarchy layout. Default: 'down'. */
    orientation?: 'down' | 'right' | 'up' | 'left';
    /** The packing mode to use for the layout. Not used by 'lens' or 'tweak'. Default: 'rectangle'. */
    packing?: 'adaptive' | 'circle' | 'rectangle' | 'none';
    /** The spacing between nodes at each level of the sequential layout. Default: 'auto'. */
    spacing?: 'auto' | 'equal' | 'stretched';
    /** If true, curved links are straightened. If false, they remain curved. Default: true. */
    straighten?: boolean;
    /** The spacing between levels in a sequential layout. Values must be positive. Default: 1. */
    stretch?: number;
    /** The tidy option pushes apart the components of the chart so they don't overlap. Not used by 'lens'. Overridden by the packing option. Default: true. */
    tidy?: boolean;
    /** Controls how close nodes are to each other, with higher values being closer. Must be in the range 0 to 10. Default: 5. */
    tightness?: number;
    /** If animated, the time the animation should take, in milliseconds. Default: 700. */
    time?: number;
    /** A node id or an array of node ids which should be at the top of the hierarchy/centre of the radial layout.
    Required for the 'hierarchy' and 'radial' layouts, unless the level option is specified. If both 'level' and 'top' are specified, 'top' is ignored. */
    top?: string | string[];
  }

  export interface LockOptions {
    /** Whether to show a wait icon while the chart is locked. */
    wait?: boolean;
  }

  export interface Band {
    /** The colour of the band. Default: light grey. */
    c?: string;
    /** Whether the band label should be displayed in bold font. Default: false. */
    fb?: boolean;
    /** The colour for the band label font. Default: light grey. */
    fc?: string;
    /** The font family to use for the band label. The default is inherited from the chart.options() `iconFontFamily` setting. */
    ff?: string;
    /** The font size (pt) of the band label. Default: 20, but may be reduced to fit the label in the band. */
    fs?: number;
    /** The text of the band label. */
    t?: string;
    /** The width of the band, in world coordinates. Default: 100. */
    w?: number;
    /** The position of the centre of the band along the X-axis, in world coordinates. Default: 0. */
    x?: number;
  }

  export interface ImageAlignmentOptions {
    /** How far to move the icon horizontally. The value is a percentage from -50 to 50. Default: 0. */
    dx?: number;
    /** How far to move the icon vertically. The value is a percentage from -50 to 50. Default: 0. */
    dy?: number;
    /** The enlargement factor relative to the icon's parent. Value must be greater than 0. Default: 1. */
    e?: number;
  }

  export interface LinkEnds {
    /** Whether link ends should avoid node labels. Default: true. */
    avoidLabels?: boolean;
    /** Controls the spacing between link ends and nodes. 'loose' - there is a small gap between the link end and and the node.
    'tight' - there is no gap between the link end and the node. Default: 'tight'. */
    spacing?: 'loose' | 'tight';
  }

  export interface LinkStyleOptions {
    /** Controls the positioning of multiple glyphs on links without labels. 'along' - glyphs are drawn along the link.
    'horizontal' - glyphs are drawn horizontally. Default: 'horizontal'. */
    glyphs?: 'along' | 'horizontal';
    /** Only for links with a colour gradient (c2 property set). Controls the size of the fraction at the midpoint of the link where the colour transition occurs. Must be between 0 and 1, with 0 providing an immediate transition between colours. The rest of the link is drawn with solid colours. Default: 0.75. */
    transition?: number;
    /** Controls the orientation of labels, glyphs and bubbles on links. When true, sub-items are rotated to match the link orientation.  Note that enabling inline overrides the 'glyphs' option. Default: false. */
    inline?: boolean;
  }

  export interface Bands {
    /** Definitions for each of the bands. */
    bands?: Band[];
    /** Whether labels are displayed at the bottom of the bands. Default: false. */
    bottom?: boolean;
    /** Whether labels are displayed at the top of the bands. Default: true. */
    top?: boolean;
  }

  export interface Logo {
    /** The position of the logo. Default: 'ne'. */
    p?: 'ne' | 'nw' | 'se' | 'sw';
    /** The URL of the logo to be displayed, or null for no logo. On Retina devices, KeyLines will also check for a double-resolution @2x version of the logo, e.g. `path/to/images/myAwesomeLogo@2x.png` */
    u?: string | null;
    /** The horizontal offset in pixels from the logo's default position. Default: 0. */
    x?: number;
    /** The vertical offset in pixels from the logo's default position. Default: 0. */
    y?: number;
  }

  export interface NavigationOptions {
    /** The position of the navigation controls. Default: 'nw'. */
    p?: 'ne' | 'nw' | 'se' | 'sw';
    /** Whether the navigation controls are displayed. You can also pass `navigation: undefined` to hide the navigation controls. Default: true. */
    shown?: boolean;
    /** The horizontal offset in pixels from the navigation controls' default position. Default: 0. */
    x?: number;
    /** The vertical offset in pixels from the navigation controls' default position. Default: 0. */
    y?: number;
  }

  export interface OverviewOptions {
    /** The background colour of the overview window. Default: 'white' */
    backColour?: string;
    /** The colour of the border and view marker of the overview window. Default: 'light grey' */
    borderColour?: string;
    /** Whether the icon the user can click on to open/close the overview is shown. Default: true. */
    icon?: boolean;
    /** The position of the overview window. Default: 'se'. */
    p?: 'ne' | 'nw' | 'se' | 'sw';
    /** Whether the overview window is displayed. Note that you can also pass `overview: undefined` to hide the overview window. Default: false. */
    shown?: boolean;
    /** The size of the overview window in pixels. Default: 100. */
    size?: number;
  }

  export interface SelectedLinkOptions {
    /** The distance to back-off from end id1 as a ratio of the total length of the link line. Must be between 0 and 1. */
    b1?: number;
    /** The distance to back-off from end id2 as a ratio of the total length of the link line. Must be between 0 and 1. */
    b2?: number;
    /** The colour of the link line itself. */
    c?: string;
    /** If specified, the link will have a colour gradient, with colour `c` at the `id1` end and colour `c2` at the `id2` end. */
    c2?: string;
    /** Whether the label should be displayed in bold font. */
    fb?: boolean;
    /** The background colour of the font. The default is a subtle effect using white with an alpha channel. */
    fbc?: string;
    /** The colour for the label font. */
    fc?: string;
    /** The font family to use for the label. */
    ff?: string;
    /** Options to customise the flow animation on the link. true provides a default flow. Note that enabling flow will override the `ls` property. */
    flow?: boolean | FlowOptions;
    /** The font size (pt) of the link label. */
    fs?: number;
    /** The style of the link line. */
    ls?: 'solid' | 'dashed' | 'dotted';
    /** The link label at the id1 end. Use new lines for multiline labels. Strings inherit properties from the label at the centre of the link. Note that the type must match that of the t1 property on the link. */
    t1?: string | LinkEndLabel;
    /** The link label at the id2 end. Use new lines for multiline labels. Strings inherit properties from the label at the centre of the link. Note that the type must match that of the t2 property on the link. */
    t2?: string | LinkEndLabel;
    /** The width of the link line. */
    w?: number;
  }

  export interface SelectedNodeOptions {
    /** The border colour. */
    b?: string;
    /** The style of the border line. */
    bs?: 'solid' | 'dashed';
    /** The width of the node's border. */
    bw?: number;
    /** The fill colour. */
    c?: string;
    /** The enlargement factor for the node. */
    e?: number;
    /** Whether the label should be displayed in bold font. */
    fb?: boolean;
    /** The background colour of the font. The default is a subtle effect using white with an alpha channel. */
    fbc?: string;
    /** The colour for the label font. */
    fc?: string;
    /** The font family to use for the label. */
    ff?: string;
    /** The font icon used on the node. */
    fi?: FontIcon;
    /** The font size (pt) of the node label. */
    fs?: number;
    /** A halo object. */
    ha0?: Halo;
    /** A halo object. */
    ha1?: Halo;
    /** A halo object. */
    ha2?: Halo;
    /** A halo object. */
    ha3?: Halo;
    /** A halo object. */
    ha4?: Halo;
    /** A halo object. */
    ha5?: Halo;
    /** A halo object. */
    ha6?: Halo;
    /** A halo object. */
    ha7?: Halo;
    /** A halo object. */
    ha8?: Halo;
    /** A halo object. */
    ha9?: Halo;
    /** The style of a combo when open. */
    oc?: OpenStyleOptions;
    /** Whether resize handles should be shown. */
    re?: boolean;
    /** If the tc parameter ('text centre') is true, the label is shown in the centre of the node. If it is false then the label is shown at the bottom of the node. Default: false for nodes with images, true for other nodes. */
    tc?: boolean;
    /** The URL of the node image. */
    u?: string;
  }

  export interface ChartZoomOptions {
    /** If true, the chart will adapt to improve the visual appearance at low zoom levels; small nodes are enlarged, and links and text fade. Default: false. */
    adaptiveStyling?: boolean;
  }

  export interface TruncateLabelsOptions {
    /** The maximum length labels can be before they are truncated, in characters. When enabled, labels are truncated to the length specified, and the last three characters of the string are replaced with `...`. Default: 30. */
    maxLength?: number;
    /** Controls whether the full label is displayed on hover. You can change the hover interval using the `hover` option. Not supported on touch devices. Default: true. */
    showOnHover?: boolean;
  }

  export interface WatermarkOptions {
    /** The vertical alignment of the watermark text. Default: 'centre'. */
    a?: 'top' | 'bottom' | 'centre';
    /** Whether the watermark is to be shown in bold. Default: false. */
    fb?: boolean;
    /** The background colour for the watermark text. */
    fbc?: string;
    /** The colour of the watermark text. */
    fc?: string;
    /** The font family to use. The default is inherited from the chart.options() `iconFontFamily` setting. */
    ff?: string;
    /** The watermark's font size (pt). Default: 80. */
    fs?: number;
    /** The text of the watermark. */
    t?: string;
    /** The URL of the watermark if an image is to be shown. */
    u?: string;
  }

  export interface Gradient {
    /** Defines the gradient colours. */
    stops: GradientColour[];
  }

  export interface GradientColour {
    /** Defines how far down the background the corresponding colour should apply. Should be between 0 and 1. */
    r: number;
    /** The colour to apply at the corresponding `r` value. */
    c: string;
  }

  export interface ComboLinkStyle {
    /** The distance to back-off from end id1 as a ratio of the total length of the link line. Value in the range 0 to 1. */
    b1?: number;
    /** The distance to back-off from end id2 as a ratio of the total length of the link line. Value in the range 0 to 1. */
    b2?: number;
    /** The colour of the link line itself. */
    c?: string;
    /** The style of the link line. */
    ls?: 'solid' | 'dashed' | 'dotted';
    /** The width of the link line. Also affect the size of arrowheads if present. */
    w?: number;
  }

  export interface StyleOptions {
    /** Sets the style of the counter glyph. Glyphs are only shown on closed combos. The default is red in the top right corner showing the number of nodes contained within the combo. */
    comboGlyph?: Glyph | null;
    /** Settings for the style of combo links created through using combine, or by adding new links. Any properties not specified will be copied from a link that the combo link contains. */
    comboLinks?: ComboLinkStyle;
    /** Settings for the open style of combos. The default is a light grey background with a grey border. */
    openCombos?: OpenStyleOptions;
  }

  export interface ChartOptions {
    /** Controls the appearance of arrows on links. Arrowhead size is also proportional to the link width `w`. Default: 'normal'. */
    arrows?: 'normal' | 'small' | 'large' | 'xlarge';
    /** The colour to use for the chart background. Default: 'white'. */
    backColour?: string;
    /** The alpha value to apply to backgrounded items, in the range 0 to 1. Default: 0.2. */
    backgroundAlpha?: number;
    /** Set to give the chart a set of labelled vertical background bands */
    bands?: Bands;
    /** The rgb colour to use for the navigation and overview window controls.
    Only the hue and saturation of the colour are used: the lightness is fixed.
    To further customise the overview window, use the backColour and borderColour properties. */
    controlColour?: string;
    /** Settings to control the default style of certain chart objects */
    defaultStyles?: StyleOptions;
    /** Settings to control how dragging operations work in the chart. */
    drag?: DragOptions;
    /** If true, drag operations will pan the chart automatically
    if the mouse or touch position moves near the edge of or outside the chart area.
    If false, the chart will not pan if the mouse or touch position moves near the
    edge of the chart area during a drag operation, and the drag will be cancelled
    if the mouse moves outside the chart area. Default: true. */
    dragPan?: boolean;
    /** The default font family to use, for example 'helvetica'.
    To set multiple font families, separate each with a space.
    If you set multiple font families, only the first one supported by the browser is used. Default: 'sans-serif'. */
    fontFamily?: string;
    /** Set to give the chart a background gradient fill that runs from top to bottom of the chart */
    gradient?: Gradient;
    /** If true, dragging the chart background drags all items.
    If false, dragging the chart background draws a bounding box for selecting items. Default: false. */
    handMode?: boolean;
    /** The number of milliseconds delay before the hover event is triggered. Default: 150. */
    hover?: number;
    /** The default font family to use for font icons, for example 'FontAwesome' or 'Octicons'.
    If you set multiple font families, only the first one supported by the browser is used. Default: 'sans-serif'. */
    iconFontFamily?: string;
    /** For each image path or font icon, set the position and scale.
    The imageAlignment should contain a property with the path of the image or the font icon which is to be adjusted. */
    imageAlignment?: IdMap<ImageAlignmentOptions>;
    /** An integer to move the label text up or down. Useful only for certain fonts where the baseline is irregular (e.g. Open Sans). */
    labelOffset?: number;
    /** Settings that control how the ends of links are drawn. */
    linkEnds?: LinkEnds;
    /** Settings to control how links are drawn. */
    linkStyle?: LinkStyleOptions;
    /** Settings for the logo to be displayed in a corner of the chart. */
    logo?: Logo;
    /** Controls how links are selected when dragging a selection marquee. Default: 'centre'. */
    marqueeLinkSelection?: 'centre' | 'ends' | 'off';
    /** Sets the maximum zoom for items, from minZoom to 4. Values around 1 are suggested for an optimal result. Default: 4. */
    maxItemZoom?: number;
    /** Sets the minimum zoom for the view.
    Use a smaller value to allow the chart to be zoomed out further.
    The value can be from 0.001 to 1. Default: 0.05. */
    minZoom?: number;
    /** Settings for the navigation controls */
    navigation?: NavigationOptions;
    /** Settings for the overview window. */
    overview?: OverviewOptions;
    /** Specifies how to draw selected links. If set, overrides the properties of selected links when they are drawn. If null or undefined, selected links are drawn with a circle in the colour specified by the selectionColour chart option. */
    selectedLink?: SelectedLinkOptions | null;
    /** Specifies how to draw selected nodes. If set,overrides the properties of selected nodes when they are drawn. If null or undefined, selected nodes are drawn with a border in the colour specified by the selectionColour chart option. */
    selectedNode?: SelectedNodeOptions | null;
    /** The default colour to use for items selected on the chart. Default: 'rgb(114, 179, 0)'. */
    selectionColour?: string;
    /** The default font colour to use for items selected on the chart. Default: 'rgb(255, 255, 255)'. */
    selectionFontColour?: string;
    /** If true, links from a node to itself can be added to the chart. If false, such links are ignored. Default: false. */
    selfLinks?: boolean;
    /** If specified, an object whose properties control how item labels are truncated. If not specified, item labels are not truncated. */
    truncateLabels?: TruncateLabelsOptions;
    /** An object whose properties are the settings for the watermark in the centre of the chart. */
    watermark?: WatermarkOptions;
    /** Settings to control how the chart zooms. */
    zoom?: ChartZoomOptions;
  }

  export interface PanOptions {
    /** Whether the transition should be animated. Default: false. */
    animate?: boolean;
    /** The length of the animation in milliseconds. Default: 1000. */
    time?: number;
  }

  export interface PingOptions {
    /** The rgb colour to use for the animated effect. Default: 'mid-grey'. */
    c?: string;
    /** The maximum width of the links' animated effect. Default: 40. */
    lw?: number;
    /** The radius of the nodes' halo at the end of the animation. Default: 80. */
    r?: number;
    /** The number of times the animation should be repeated. Default: 1. */
    repeat?: number;
    /** The time the animation should take, in milliseconds. Default: 800. */
    time?: number;
    /** The width of the nodes' halo at the end of the animation. Default: 20. */
    w?: number;
  }

  export interface ShowOptions {
    /** Whether the transition should be animated. Default: false. */
    animate?: boolean;
    /** The length of the animation in milliseconds. Default: 1000. */
    time?: number;
  }

  export interface ToDataURLOptions {
    /** How the current view settings are mapped when generating the image. Default: 'exact'. */
    fit?: 'exact' | 'view' | 'chart' | 'oneToOne';
    /** Whether the chart background gradient (if present) should be drawn. Default: true. */
    gradient?: boolean;
    /** Whether the logo (if present) should be drawn. Default: true. */
    logo?: boolean;
    /** If true, the image is drawn as if it were a new component at 1-1 scale.
     This means that any logo or watermark will be drawn at 1-1 in the image. If false, the logo and watermark are sized to fit the image size. Default: false. */
    noScale?: boolean;
    /** Whether the current selection (if present) should be drawn as selected in the image. Default: false. */
    selection?: boolean;
    /** Whether the watermark (if present) should be drawn. Default: true. */
    watermark?: boolean;
  }

  export interface Transition {
    /** Whether the transition should be animated. Default: false. */
    animate?: boolean;
    /**  The time the animation should take, in milliseconds. Default: 1000. */
    time?: number;
  }

  export interface ViewOptions {
    /** The level of zoom. 1 is 1-to-1. Note that you cannot use the zoom option in map mode. For details on controlling zoom in map mode see the Map Mode documentation. Default: 1. */
    zoom: number;
    /** The view offset in the X direction measured in pixels. Default: 0. */
    offsetX: number;
    /** The view offset in the Y direction measured in pixels. Default: 0. */
    offsetY: number;
    /** The height of the view (read only). */
    height: number;
    /** The width of the view (read only). */
    width: number;
  }

  export interface ViewOptionsUpdate {
    /** The level of zoom. 1 is 1-to-1. Note that you cannot use the zoom option in map mode. For details on controlling zoom in map mode see the Map Mode documentation. Default: 1. */
    zoom?: number;
    /** The view offset in the X direction measured in pixels. Default: 0. */
    offsetX?: number;
    /** The view offset in the Y direction measured in pixels. Default: 0. */
    offsetY?: number;
  }

  export interface Coordinates {
    /** The x coordinate */
    x: number;
    /** The y coordinate */
    y: number;
  }

  export interface ZoomOptions {
    /** Whether the transition should be animated. Default: false. */
    animate?: boolean;
    /** The length of the animation in milliseconds. Default: 1000. */
    time?: number;
    /** The id or array of ids to zoom to in 'fit' or 'height' mode. If no ids are specified 'fit' will fit the chart to the window. 'height' will fit the chart height to the window. */
    ids?: string | string[];
  }

  export interface ComboArrangeOptions {
    /** Whether the operation should be animated. Default: true. */
    animate?: boolean;
    /** Controls how nodes are arranged inside an open combo. 'lens' - items are arranged automatically with connected nodes next to each other.
    'concentric' - items are arranged automatically inside a circle with larger items at the centre.
    'none' - items are kept in their original positions. Default: lens. */
    name?: 'lens' | 'concentric' | 'none';
    /** If true, the open combos will be resized to fit their contents. If false, they will not be resized, unless the contents are beyond the current boundary. Default: true. */
    resize?: boolean;
    /** If animated, the time the animation should take, in milliseconds. Default: 250. */
    time?: number;
  }

  export interface CloseOptions {
    /** Whether the operation should be animated. Default: true. */
    animate?: boolean;
    /** If animated, the time the animation should take, in milliseconds. Default: 250. */
    time?: number;
  }

  export interface ComboDefinition {
    /** If defined, all properties will be transferred to the new combo's `d` property. */
    d?: any;
    /** An x offset for positions of members of the combo if it is later uncombined. Default: 0. */
    dx?: number;
    /** A y offset for positions of members of the combo if it is later uncombined. Default: 0. */
    dy?: number;
    /** The ids of nodes to combine. This can contain one or more node ids. */
    ids: string[];
    /** The style of the counter glyph. Glyphs are only shown on closed combos. The default is red in the top right corner showing the number of nodes contained within the combo. Set to null for no glyph. You can add more glyphs using "style.g". */
    glyph?: Glyph | null;
    /** The label to use for the combo. If unspecified, a label will be generated from the `t` properties of the combo's child nodes. */
    label?: string;
    /** The style of the closed combo node. If not specified, the style will be the same as the first node in the ids array. If `style.hi` is not specified, the combo will be visible if any of its member nodes are visible. */
    style?: NodeStyle;
    /** The style of the open combo node. If not specified, the style will be set to the open combo style from `defaultStyles`. */
    openStyle?: OpenStyleOptions;
    /** Whether the combo should be created in the open state. Default: false. */
    open?: boolean;
    /** The chart position of the final combo. 'average' - use the average position of the nodes to centre the arrangement.
    'first' - use the position of the first node in the ids array. Default: 'average'. */
    position?: 'average' | 'first';
  }

  export interface CombineOptions {
    /** Whether the combination(s) should be animated. Default: true. */
    animate?: boolean;
    /** Controls how nodes are arranged inside an open combo. 'lens' - items are arranged automatically with connected nodes next to each other.
    'concentric' - items are arranged inside a circle with larger items at the centre.
    'none' - items are kept in their original positions. Default: lens. */
    arrange?: 'lens' | 'concentric' | 'none';
    /** Whether the combo(s) should be selected. Default: true. */
    select?: boolean;
    /** If animated, the time the animation should take, in milliseconds. Default: 250. */
    time?: number;
  }

  export interface ComboFindOptions {
    /** There's a parent/child relationship between a combo and the items it contains. 'first': finds the immediate parent of the item.
    'top': finds the parent at the top of the nested combo hierarchy. Default: 'top'. */
    parent?: 'top' | 'first';
  }

  export interface IsComboOptions {
    /** Specifies which types of item are tested. Default: 'all'. */
    type?: 'node' | 'link' | 'all';
  }

  export interface OpenOptions {
    /** Whether the operation should be animated. Default: true. */
    animate?: boolean;
    /** If animated, the time the animation should take, in milliseconds. Default: 250. */
    time?: number;
  }

  export interface TransferOptions {
    /** Whether the transfer operation should be animated. Default: true. */
    animate?: boolean;
    /** Controls how nodes are arranged inside source and destination open combos. 'lens' - items are arranged automatically with connected nodes next to each other.
    'concentric' - items are arranged inside a circle with larger items at the centre.
    'none' - items are kept in their original positions. Default: lens. */
    arrange?: 'lens' | 'concentric' | 'none';
    /** If true, the open combos will be resized to fit their contents. If false, they will not be resized, unless the contents are beyond the current boundary. Default: true. */
    resize?: boolean;
    /** If animated, the time the animation should take, in milliseconds. Default: 250. */
    time?: number;
  }

  export interface UncombineOptions {
    /** Whether the operation should be animated. Default: true. */
    animate?: boolean;
    /** Whether all nodes inside the combo (including nodes inside nested combos) should be uncombined. If false, only the first level of the combo is uncombined. Default: false. */
    full?: boolean;
    /** Whether the uncombined nodes should be selected. Default: true. */
    select?: boolean;
    /** If animated, the time the animation should take, in milliseconds. Default: 250. */
    time?: number;
  }

  export interface MapOptions {
    /** Whether showing and hiding the map should be animated. Default: true. */
    animate?: boolean;
    /** Use this to pass options directly into the Leaflet constructor. */
    leaflet?: any;
    /** Specifies how much space, in pixels, to leave around the map when zooming to fit. Default: 5. */
    padding?: number;
    /** A string specifying the url template for map tiles, in the form `http://example.com/path/{z}/{x}/{y}.png`, or an object in the Leaflet TileLayer options format, with an additional 'url' property specifying the url template. If set to null, the tiles layer will not be created. */
    tiles?: object | string | null;
    /** If animated, the time that showing or hiding the map should take, in milliseconds. Default: 800. */
    time?: number;
    /** Controls how items are positioned when transitioning from map mode to network mode. Use 'restore' to move items back to their previous positions, or 'layout' to position using a 'standard' layout. Default: 'restore'. */
    transition?: 'restore' | 'layout';
  }

  export interface BetweennessOptions {
    /** Whether the betweenness computation should consider the direction of links. Default: false. */
    directed?: boolean;
    /** This defines if the betweenness measure should be normalized by component,
    by chart or not normalized. Default: 'component'. */
    normalization?: 'unnormalized' | 'chart' | 'component';
    /** The name of the custom property which defines each link's length. Custom properties are set on the `d` property of the links. */
    value?: string;
    /** If true, the path length of any link is the reciprocal of the value ( 1 / value ). Default: false. */
    weights?: boolean;
    /** Whether the function should also iterate over hidden items in the chart. Default: false. */
    all?: boolean;
  }

  export interface ClosenessOptions {
    /** 'from' only includes links in the direction of arrows, 'to' only includes links against the direction of arrows, and 'any' includes any link regardless of arrows.
    Note that to use 'from' or 'to', your graph must have arrows on links. Default: 'any'. */
    direction?: 'from' | 'to' | 'any';
    /** This defines if the closeness measure should be normalized by component or by chart. Allowed values are 'chart' or 'component'. Default: 'component'. */
    normalization?: 'chart' | 'component';
    /** The name of the custom property which defines each link's value. Custom properties mean properties set on the 'd' property of the links. */
    value?: string;
    /** This option means that the path length of any link is the reciprocal of the value, i.e. ( 1 / value ). Default: false. */
    weights?: boolean;
    /** Whether the function should also iterate over hidden items in the chart. Default: false. */
    all?: boolean;
  }

  export interface ClustersOptions {
    /** The custom property which defines each link's value. Custom properties are set on the `d` property of the links. Higher valued links tend to cluster their nodes more closely. */
    value?: string;
    /** A number from 0 to 10 that affects cluster size. Higher values give smaller clusters, but more of them; lower values give larger clusters, but not as many. Default: 5. */
    factor?: number;
    /** If true, returns  the same result every time you run a cluster. Default: true. */
    consistent?: boolean;
    /** Whether the function should also iterate over hidden items in the chart. Default: false. */
    all?: boolean;
  }

  export interface ComponentsResult {
    /** Array of node ids in this component */
    nodes: string[];
    /** Array of link ids in this component */
    links?: string[];
  }

  export interface ComponentsOptions {
    /** Whether the function should also iterate over hidden items in the chart. Default: false. */
    all?: boolean;
  }

  export interface DegreesOptions {
    /** 'from' counts only links with arrows pointing away from nodes (out-degree), 'to' counts only links with arrows pointing to nodes (in-degree), and 'any' counts all links regardless of whether they have arrows.
    Note that to use 'from' or 'to', your graph must have arrows on links. Default: 'any'. */
    direction?: 'from' | 'to' | 'any';
    /** The custom property which defines each link's value. Custom properties mean properties set on the 'd' property of the links. */
    value?: string;
    /** Whether the function should also iterate over hidden items in the chart. Default: false. */
    all?: boolean;
  }

  export interface DistancesOptions {
    /** 'from' counts only links with arrows pointing away from nodes (out-degree), 'to' counts only links with arrows pointing to nodes (in-degree), and 'any' counts all links regardless of whether they have arrows.
    Note that to use 'from' or 'to', your graph must have arrows on links. Default: 'any'. */
    direction?: 'from' | 'to' | 'any';
    /** The custom property which defines the distance value of a link. Custom properties mean properties set on the `d` property of the links. */
    value?: string;
    /** This option means that the path length of any link is the reciprocal of the value, i.e. ( 1 / value ). Default: false. */
    weights?: boolean;
    /** Whether the function should also iterate over hidden items in the chart. Default: false. */
    all?: boolean;
  }

  export interface EigenCentralityOptions {
    /** The custom property which defines the value of a link. Custom properties mean properties set on the `d` property of the links. If not set, all links have value 1. */
    value?: string;
    /** Whether the function should also iterate over hidden items in the chart. Default: false. */
    all?: boolean;
  }

  export interface KCoresResult {
    /** The maximum k in the graph. */
    maximumK?: number;
    /** An object whose property names are the ids of the nodes and property values are the k value for each node. */
    values?: IdMap<number>;
  }

  export interface KCoresOptions {
    /** Whether the function should also iterate over hidden items in the chart. Default: false. */
    all?: boolean;
  }

  export interface NeighboursResult {
    /** Array of neighbouring node ids */
    nodes: string[];
    /** Array of neighbouring link ids */
    links?: string[];
  }

  export interface NeighboursOptions {
    /** Whether the function should also iterate over hidden items in the chart. Default: false. */
    all?: boolean;
    /** 'from' only finds neighbours in the direction of arrows, 'to' only finds neighbours against the direction of arrows, and 'any' finds neighbours on any link regardless of arrows.
    Note that to use 'from' or 'to', your graph must have arrows on links. Default: 'any'. */
    direction?: 'from' | 'to' | 'any';
    /** This defines how far away neighbours can be from the passed ids. Default: 1. */
    hops?: number;
  }

  export interface PageRankOptions {
    /** The custom property which defines the value of a link. Custom properties mean properties set on the `d` property of the links. If not set, all links have value 1. */
    value?: string;
    /** If false, all the links are treated as undirected for the PageRank computation. Default: true. */
    directed?: boolean;
    /** Whether the function should also iterate over hidden items in the chart. Default: false. */
    all?: boolean;
  }

  export interface ShortestPathsResult {
    /** One of the shortest paths found - returned as an array of alternating node and link ids, including the start and end nodes. */
    onePath: string[];
    /** An array describing the same path as onePath, but containing node ids only, including the start and end nodes. */
    one: string[];
    /** An array of all node and link ids that are on all the shortest paths, including the start and end nodes.  */
    items: string[];
    /** The length of the shortest path - more precisely the combined link value of the path. */
    distance: number;
  }

  export interface ShortestPathsOptions {
    /** 'from' only traverses links in the direction of arrows, 'to' only traverses links against the direction of arrows, and 'any' can traverse any link regardless of arrows.
    Note that to use 'from' or 'to', your graph must have arrows on links. Default: 'any'. */
    direction?: 'from' | 'to' | 'any';
    /** The custom property which defines the value of a link. Custom properties mean properties set on the `d` property of the links. */
    value?: string;
    /** Whether the path length of any link is the reciprocal of the `value`, i.e. ( 1 / `value` ). Default: false. */
    weights?: boolean;
    /** Whether the function should also iterate over hidden items in the chart. Default: false. */
    all?: boolean;
  }

  export interface Component {
    /** The DOM element or id where you want to insert the component. */
    container?: string | HTMLElement;
    /** The id of the component. If not set, one will automatically be assigned. */
    id?: string;
    /** **DEPRECATED** The DOM element that you want to replace with the component. For more information see The Resizing Components Documentation. */
    element?: HTMLElement;
    /** The type of component to create. Default: chart. */
    type?: 'chart' | 'timebar';
    /** The options for the new component. */
    options?: ChartOptions | TimeBarOptions;
  }

  export interface GraphEngineOptions {
    /** If true, links from a node to itself can be loaded into the graph engine. If false, such links are ignored. Default: false. */
    selfLinks?: boolean;
  }

  export interface PathsOptions {
    /** **DEPRECATED** Not used. */
    assets?: string;
    /** The path to use for images. */
    images?: string;
  }

  export interface DragControlOptions {
    /** Whether dragging is allowed in the x-direction. Default: true. */
    x?: boolean;
    /** Whether dragging is allowed in the y-direction. Default: true. */
    y?: boolean;
    /** Ids of items that will also be dragged, even if they are not selected. Only applies to the `move` dragger. */
    add?: string[];
    /** Whether dragging nodes in combos also drags the combos. Only applies to the `move` dragger. Default: true. */
    combos?: boolean;
  }

  /**
   * Chart Options related to dragging
   */
  export interface DragOptions {
    /** Controls if links will be offset when selected and dragged. If false, they cannot be dragged and can only be selected by directly clicking them in pointer mode. Default: true. */
    links: boolean;
    /** If true, the chart automatically pans when dragging an item near the boundary of the visible chart area. */
    panAtBoundary: boolean;
  }

  export interface Locale {
    /** An array of two strings giving the text for AM and PM for 12-hour clock times and 2 more optional strings, used to label time bar intervals for the first and second halves of days. Default: ['AM', 'PM']. */
    ampm?: string[];
    /** Whether a 12-hour clock should be used to display times. If false, a 24-hour clock is used. Default: true. */
    h12?: boolean;
    /** A prefix used to indicate halves of years. Default: 'H'. */
    half?: string;
    /** An array of strings giving the full names of the months, starting with January. Default: ['January', etc]. */
    longMonths?: string[];
    /** A string controlling the order of dates. Supported values are 'dmy' for day-month-year, and 'mdy' for month-day-year. Default: 'mdy'. */
    order?: string;
    /** A prefix used to indicate quarters of years. Default: 'Q'. */
    quarter?: string;
    /** An array of strings giving abbreviated names of the months, starting with January. Default: ['Jan', etc]. */
    shortMonths?: string[];
  }

  export interface HeightChange {
    /** Whether height changes should be animated. Default: true. */
    animate?: boolean;
    /** If animated, the time the animation should take, in milliseconds. Default: 200. */
    time?: number;
  }

  export interface Histogram {
    /** The colour of the histogram bars. Default: light grey. */
    colour?: string;
    /** The colour of the histogram bars when they are hovered over. Default: grey. */
    highlightColour?: string;
    /** The colour of histogram bars which contain marked times. Default: light red. */
    markColour?: string;
    /** The colour of the marked histogram bars when they are hovered over. Default: red. */
    markHiColour?: string;
  }

  export interface MaxRange {
    /** The size of the maximum range, in the units specified. */
    value?: number;
    /** The unit of the maximum range. */
    units?: TimeBarUnits;
  }

  export interface MinScale {
    /** The number of the specified units. Default: 1. */
    value?: number;
    /** The unit of the minimum scale level. Default: 'sec'. */
    units?: TimeBarUnits;
  }

  export interface Scale {
    /** The colour of the time scale section that is hovered over. Default: light grey. */
    highlightColour?: string;
    /** Whether the major time scale (the lower scale) is shown. Default: true. */
    showMajor?: boolean;
    /** Whether the minor time scale (the higher scale) is shown. Default: true. */
    showMinor?: boolean;
  }

  export interface TimeBarOptions {
    /** Options controlling the time bar when type is set to 'area'. */
    area?: TimeBarAreaOptions;
    /** The colour to use for the background of the time bar. Default: white. */
    backColour?: string;
    /** The colour to set the font of the time bar (used in the scales). Default: grey. */
    fontColour?: string;
    /** The font family to use, for example, 'sans-serif'. If you set multiple font families, only the first one supported by the browser is used. Default: 'sans-serif'. */
    fontFamily?: string;
    /** The font size to use. There is no size limit, but most fonts look best with a value between 7 and 13. Default: 12. */
    fontSize?: number;
    /** Options controlling the grouping within histogram bars. */
    groups?: TimeBarDataGroups;
    /** Options controlling the animation of height changes for stacked histogram bars and selection lines. */
    heightChange?: HeightChange;
    /** Options for the histogram bars. */
    histogram?: Histogram;
    /** Specifies how dates and times are displayed. */
    locale?: Locale;
    /** Specifies the time range at the time bar's maximum zoom level, for example with a maxRange fixed to { units: 'hour', value: 6 } the time bar will not zoom out beyond six-hour intervals.
    This is useful if your dataset spans a large time range and you want to limit the amount of data visible.
    By default, KeyLines calculates the range between the data's earliest and latest dates/times and multiplies it by two. Default: 'auto'. */
    maxRange?: string | MaxRange;
    /** Specifies the time interval at the time bar's minimum scale level, for example with a minScale fixed to { units: 'hour', value: 6 } the time bar will not zoom in beyond six-hour intervals.
     * This can be useful when the data has no precise information about the hour or the minute of the event to stop zooming further.
     * The default behaviour scales with the range of the data. */
    minScale?: MinScale;
    /** The speed that the time bar moves at when playing, in pixels per second.
    May be negative to animate backwards in time in 'normal' mode, or to animate the right hand slider moving backwards in time in 'extend' mode. Default: 60. */
    playSpeed?: number;
    /** Options for the minor and major time scales. */
    scale?: Scale;
    /** Whether the time bar should display as a series of rectangular histogram bars or as a smooth area plot. */
    type?: 'histogram' | 'area';
    /** Whether the control bar at the base of the time bar is shown. Default: true. */
    showControlBar?: boolean;
    /** Whether the extend button is displayed. Default: false. */
    showExtend?: boolean;
    /** Whether the fit button is displayed. Default: true. */
    showFit?: boolean;
    /** Whether the play button is displayed. Default: true. */
    showPlay?: boolean;
    /** The colour of the the slider. The default is white with an opacity of 0.6. */
    sliderColour?: string;
    /** The colour of the bars at the inner edge of the slider. Default: grey. */
    sliderLineColour?: string;
    /** Specifies slider behaviour. Default: 'fixed'. */
    sliders?: 'fixed' | 'free' | 'none';
  }

  export interface TimeBarAreaOptions {
    /** The colour of the time bar area border line. The fill area will be a translucent version of this colour. */
    colour?: string;
  }

  export interface TimeBarPanOptions {
    /** Whether the transition should be animated. Default: true. */
    animate?: boolean;
    /** The length of the animation in milliseconds. Default: 200. */
    time?: number;
  }

  export interface TimeBarPlayOptions {
    /** If true, the start of the range stays fixed and the end is extended. Default: false. */
    extend?: boolean;
  }

  export interface TimeBarRangeResult {
    /** The start time for the time range of the time bar. */
    dt1: Date;
    /** The end time for the time range of the time bar. */
    dt2: Date;
  }

  export interface TimeBarRangeOptions {
    /** Whether the transition should be animated. Default: true. */
    animate?: boolean;
    /** The length of the animation in milliseconds. Default: 200. */
    time?: number;
  }

  export interface TimeBarDataGroups {
    /** The custom property that defines item grouping, or null to disable bar groups. Default: null. */
    groupBy?: string | null;
    /** Values of the custom property that the time bar should accept. Items with other values will be placed in an uncategorised group. Set to null to disable bar groups. Default: null. */
    categories?: (string | number)[] | null;
    /** Colours to use for bar groups, or null to use a set of default colours. Default: null. */
    colours?: string[] | null;
    /** Colours to use for bar groups when highlighted, or null to calculate highlight colours based on the bar group colours. Default: null. */
    hiColours?: string[] | null;
  }

  export type TimeBarUnits = 'sec' | 'min' | 'hour' | 'day' | 'week' | 'month' | 'year';

  export interface SelectionOptions {
    /** An id string or array of id strings. */
    id?: string | string[];
    /** The index for the selection line. This field can be omitted when a single selection is passed. */
    index?: number;
    /** The colour for the selection line. */
    c?: string;
  }

  export interface TimeBarZoomOptions {
    /** Whether the transition should be animated. Default: true. */
    animate?: boolean;
    /** When running `zoom('fit',...)`, the ids of items to include in the fit range. If not specified, all items are included. */
    id?: string | string[];
    /** The length of the animation in milliseconds. Default: 200. */
    time?: number;
  }

  export type ChartAllHandler =
  /**
    * @param name The name of the event which was captured, e.g. 'click'. */
    (name: string, ...args: any[]) => boolean;

  export type ChartClickHandler =
  /**
    * @param id The id of the item that was clicked, or null if the mouse was on the chart background.
    * @param x The x location of the click in view coordinates.
    * @param y The y location of the click in view coordinates.
    * @param button The button used. 0 is logical left button and 1 is middle. To trap the right-click use the context menu event. Note that some browser-OS configurations return 2 for a ctrl+click event.
    * @param sub The sub-item clicked, or null if the click is over the main part of the item.
    * @returns When true, suppress the selection of links when link dragging is disabled */
    (id: string | null, x: number, y: number, button: number, sub: string | null) => boolean;

  export type ChartContextmenuHandler =
  /**
    * @param id The id of the item that was right-clicked, or null if the click was on the chart background.
    * @param x The x location of the right-click in view coordinates.
    * @param y The y location of the right-click in view coordinates.
    * @param sub The sub-item, or null if over the main part of the item. */
    (id: string | null, x: number, y: number, sub: string | null) => void;

  export type ChartDblclickHandler =
  /**
    * @param id The id of the item that was double-clicked, or null if the mouse was on the chart background.
    * @param x The x location of the double-click in view coordinates.
    * @param y The y location of the double-click in view coordinates.
    * @param sub The sub-item clicked, or null if the click is over the main part of the item. */
  (id: string | null, x: number, y: number, sub: string | null) => boolean;

  export type ChartDeleteHandler =
    () => boolean;

  export type ChartDragcompleteHandler =
  /**
    * @param type The type of the drag: 'move', 'hand', 'area', 'resize', 'offset' and 'dummy' are all various types of drag.
    * @param id The id of the item being dragged, or null if no item is being dragged.
    * @param x The x location of the drag in view coordinates.
    * @param y The y location of the drag in view coordinates. */
    (type: string, id?: string | null, x?: number, y?: number) => void;

  export type ChartDragendHandler =
  /**
    * @param type The type of the drag: 'move', 'hand', 'area', 'resize', 'offset' and 'dummy' are all various types of drag.
    * @param id The id of the item being dragged, or null if no item is being dragged.
    * @param x The x location of the drag in view coordinates.
    * @param y The y location of the drag in view coordinates. */
    (type: string, id?: string | null, x?: number, y?: number) => boolean;

  export type ChartDragoverHandler =
  /**
    * @param id The id of the item underneath the dragged item, or null if the drag is over the background.
    * @param x The x location of the drag in view coordinates.
    * @param y The y location of the drag in view coordinates.
    * @param sub The sub-item hovered over, or null if the drag is over the main part of the item. */
    (id: string | null, x: number, y: number, sub: string | null) => void;

  export type ChartDragstartHandlerWithOptions =
  /**
    * @param type The type of the drag.
    * @param id The id of the item being dragged, or null if no item is being dragged.
    * @param x The x location of the drag in view coordinates.
    * @param y The y location of the drag in view coordinates.
    * @param sub The sub-item dragged, or null if the drag is over the main part of the item. */
    (type: 'hand' | 'move', id: string | null, x: number, y: number, sub: string | null) => DragControlOptions | boolean;

  export type ChartDragstartHandler =
  /**
    * @param type The type of the drag.
    * @param id The id of the item being dragged, or null if no item is being dragged.
    * @param x The x location of the drag in view coordinates.
    * @param y The y location of the drag in view coordinates.
    * @param sub The sub-item dragged, or null if the drag is over the main part of the item. */
    (type: 'area' | 'resize' | 'offset' | 'dummy' | 'slider' | 'overview', id?: string | null, x?: number, y?: number, sub?: string | null) => boolean;

  export type ChartEditHandler =
  /**
    * @param selection An array of the currently selected items. */
    (selection: string[]) => void;

  export type ChartErrorHandler =
  /**
    * @param message The error message.
    * @param error The error object thrown. */
    (message: string, error: Error) => void;

  export type ChartHoverHandler =
  /**
    * @param id The id of the item the mouse is over, or null if the mouse is over the chart background.
    * @param x The x location of the mouse.
    * @param y The y location of the mouse.
    * @param sub The sub-item hovered over, or null if the hover is over the main part of the item. */
    (id: string | null, x: number, y: number, sub: string | null) => void;

  export type ChartKeydownHandler =
  /**
    * @param keyCode The keyCode of the key pressed.
    * @param ctrlKey True if the `ctrl` key was active when the key was pressed, otherwise false.
    * @param shiftKey True if the `shift` key was active when the key was pressed, otherwise false. */
    (keyCode: number, ctrlKey: boolean, shiftKey: boolean) => boolean;

  export type ChartMapHandler =
  /**
    * @param type The type of the event: 'showstart', 'showend', 'hidestart' or 'hideend'. */
    (type: string) => void;

  export type ChartMousedownHandler =
  /**
    * @param id The id of the item under the mouse, or null if the mouse was on the chart background.
    * @param x The x location of the mouse cursor in view coordinates.
    * @param y The y location of the mouse cursor in view coordinates.
    * @param button The button used. 0 is logical left button and 1 is middle. To trap the right-click use the context menu event. Note that some browser-OS configurations return 2 for a ctrl+click event.
    * @param sub The sub-item, or null if the mouse is over the main part of the item. */
    (id: string | null, x: number, y: number, button: number, sub: string | null) => boolean;

  export type ChartMousewheelHandler =
  /**
    * @param delta Abstract value describing how far the wheel 'turned'. The sign indicates the direction of the movement.
    * @param x The x location of the mouse cursor in view coordinates.
    * @param y The y location of the mouse cursor in view coordinates. */
    (delta: number, x: number, y: number) => boolean;

  export type ChartOverviewHandler =
  /**
    * @param state The final state of the overview after the action completes - either 'open' or 'close'. */
    (state: string) => void;

  export type ChartPrechangeHandler =
  /**
    * @param change The current change event: Either 'arrange', 'arrange combo', 'close', 'combine', 'delete', 'expand', 'hide', 'layout', 'merge', 'move', 'offset', 'open', 'properties', 'resize', 'transfer' or 'uncombine'. */
    (change: string) => void;

  export type ChartProgressHandler =
  /**
    * @param task The task which is running, for example, 'layout' or 'betweenness'.
    * @param progress How near the task is to completion on a scale of 0 to 1, where 0 is just started and 1 is finished. Note that a progress of 1 indicates that the layout has finished computing, but not that the nodes have finished repositioning themselves. Layouts report progress differently depending on the layout used. */
    (task: string, progress: number) => void;

  export type ChartSelectionchangeHandler =
    () => void;

  export type ChartTouchdownHandler =
  /**
    * @param id The id of the item under the touch, or null if the touch was on the chart background.
    * @param x The x location of the touch in view coordinates.
    * @param y The y location of the touch in view coordinates.
    * @param sub The sub-item touched, or null if the touch was over the main part of the item. */
    (id: string | null, x: number, y: number, sub: string | null) => boolean;

  export type ChartViewchangeHandler =
    () => void;

  export type LayoutName = 'standard' | 'organic' | 'hierarchy' | 'sequential' | 'lens' | 'radial' | 'structural' | 'tweak';

  export type FilterFn = (item: any) => boolean;

  export interface Chart {
    /** animateProperties allows custom animations to be made and chained together.
    * @param items The item/s whose properties are to be changed.
    * @param options Options to control the animation. */
    animateProperties(items: NodeProperties | LinkProperties | ShapeProperties | (NodeProperties | LinkProperties | ShapeProperties)[], options?: AnimatePropertiesOptions): Promise<void>;

    /**  The arrange function places a set of nodes together in close proximity to each other.
    * @param name The arrangement to use.
    * @param items An array of the ids of the nodes to arrange.
    * @param options Options to control the arrangement of the nodes. */
    arrange(name: 'grid' | 'circle' | 'radial', items: string[], options?: ArrangeOptions): Promise<void>;

    /** Clear removes all items from the chart. */
    clear(): void;

    /** The combo namespace has methods for combining the nodes and links of a chart. */
    combo(): Combo;

    /** The contains function returns an array of ids of all the nodes contained inside the given shape.
    * @param shape The definition of the shape.
    * @returns The ids of the nodes contained in the shape (if any) */
    contains(shape: ShapeOptions): string[];

    /** The createLink function allows the user to draw a new link starting from a specified node.
    * @param id The id of the starting node; this node will be the id1 of the new link.
    * @param linkId The id to set on the new link.
    * @param options Options to control the style of the link.
    * @returns The id of the linked item, or null if the user did not create a link. */
    createLink(id: string, linkId: string, options?: CreateLinkOptions): Promise<string | null>;

    /** Destroys the current instance of the chart, freeing any allocated resources. */
    destroy(): void;

    /** The each function allows easy iteration over all the items in the chart. The handler is called with one parameter: the current item.
    * @param options Options controlling how to iterate over the chart items.
    * @param handler The function to be called for each item in the chart. */
    each(options: EachOptions, handler: (item: Node | Link | Shape) => void): void;

    /** The expand function is the easiest way to add new items to the chart. It performs a merge followed by a layout.
    * @param items A KeyLines chart object or an array of items to be added.
    * @param options Options to control the expanding action of the nodes. */
    expand(items: ChartData | (Node | Link | Shape)[], options?: ExpandOptions): Promise<void>;

    /** The filter function allows items in the chart to be hidden or shown depending on your own criteria.
    * @param filterFn A function which takes an item as argument. Returns true if the item should be visible, false otherwise.
    * @param options Options to control the filtering.
    * @returns A Promise. */
    filter(filterFn: FilterFn, options?: FilterOptions): Promise<FilterResult>;

    /** The foreground function allows items in the chart to be set as background or foreground items depending on your own criteria.
    * @param foregroundFn A function which takes an item as its argument, returning false if the item should be in the background, true otherwise.
    * @param options Options to control the foreground operation.
    * @returns A Object which contains the nodes and links which are in the foreground and background */
    foreground(foregroundFn: FilterFn, options?: ForegroundOptions): Promise<ForegroundResult>;

    /** Returns a copy of the item in the chart that matches the id. To update the item, use `chart.setProperties()`.
    * @param id The id string of the item to be retrieved.
    * @returns The item matched. Returns null if there is no item matching an id. */
    getItem(id: string): Node | Link | Shape | null;

    /** Returns a copy of the items in the chart which match the ids. To update the items, use `chart.setProperties()`.
    * @param ids The ids of the items to be retrieved.
    * @returns The items matched. Returns null if there is no item matching an id. */
    getItem(ids: string[]): (Node | Link | Shape | null)[];


    /** Returns info on the item at the view coordinates specified.
    * @param x The x position in view coordinates.
    * @param y The y position in view coordinates.
    * @returns An object describing the id and subItemInfo if present of the item at the specified location. */
    getItemInfoAt(x: number, y: number): ItemInfo | undefined;

    /** The graph object has methods for navigating the graph structure (the nodes and links) of a chart. */
    graph(): Graph;

    /** Hide items with the specified ids.
    * @param id The ids of items to hide.
    * @param options Options to control the hide operation. */
    hide(id: string | string[], options?: HideOptions): Promise<void>;

    /** labelPosition returns information about the label by the item with the id specified. This function does not return the label position for 't1' or 't2' labels.
    * @param id The identity of the item.
    * @returns An object containing label coordinate properties. */
    labelPosition(id: string): LabelPosition | null;

    /** The layout function positions the nodes of the chart.
    * @param name The name of the layout to be invoked. The default is 'standard'.
    * @param options Options to control features of the layout. */
    layout(name?: LayoutName, options?: LayoutOptions): Promise<void>;

    /** Replaces the chart data with the new data specified. Any existing objects in the chart will be removed.
    * @param data The data to load into the chart. */
    load(data: ChartData): Promise<void>;

    /** Locks and unlocks the chart, preventing end-user interactions: mouse, keyboard and touch events won't alter the state of the chart.
    * @param val If true, locks the chart.
    * @param options Options to control the locked appearance of the chart.
    * @returns True if the chart is locked, false otherwise. */
    lock(val?: boolean, options?: LockOptions): boolean;

    /** The map namespace has methods for displaying the chart on a map. */
    map(): Map;

    /** Adds new items to the chart, or modifies the properties of existing items on the chart.
    * @param items The data to add to the chart. */
    merge(items: ChartData | (Node | Link | Shape)[]): Promise<void>;

    /** The options function sets the current chart display and interaction options.
    * @param ChartOptions Controls the chart options.
    * @returns The current options. */
    options(ChartOptions: ChartOptions): Promise<void>;

    /** The options function gets the current chart display and interaction options. */
    options(): ChartOptions;

    /** Pans the chart in the direction specified.
    * @param direction The direction to pan the chart in.
    * @param options Options to control the pan operation. */
    pan(direction: 'up' | 'down' | 'left' | 'right' | 'selection', options?: PanOptions): Promise<void>;

    /** The ping function adds a temporary animated effect to a specified item.
    * @param id The ids of items to be animated.
    * @param options Options to control the animation */
    ping(id: string | string[], options?: PingOptions): Promise<void>;

    /** Remove items with the specified ids.
    * @param id The ids of items to remove. */
    removeItem(id: string | string[]): void;

    /** The selection function sets the current chart selection.
    * @param val Ids of items to be selected.
    * @returns The current selection as a list of item ids. */
    selection(val: string[]): string[];

    /** The selection function gets the current chart selection as an array of ids. */
    selection(): string[];

    /** The serialize function returns a complete serialization of the current chart content in the form specified by the object properties section. This can be used for saving the chart state in a database or for implementing features like undo and redo. Note: We don't recommend parsing the results of `chart.serialize()` as a way to get items. Use `chart.each()` instead. */
    serialize(): ChartData & TimeBarData;

    /** Sets the location in the DOM of the chart on the page.  Set this to null to temporarily remove it. You must specify the container parameter in `KeyLines.create()` to use `setContainer()`.
    * @param element The id string or DOM element of the parent container that the chart should be appended to. */
    setContainer(element?: string | HTMLElement | null): void;

    /** setItem creates a new item in the chart with the specified properties.
    * @param item The item to set in the chart.
    * @returns A Promise. */
    setItem(item: Node | Link | Shape): Promise<void>;

    /** setProperties changes the properties of chart items.
    * @param items The ids of items whose properties are to be changed.
    * @param useRegEx Whether the ids are to be treated as regular expression strings. The default is false. */
    setProperties(items: NodeProperties | LinkProperties | ShapeProperties | (NodeProperties | LinkProperties | ShapeProperties)[], useRegEx?: boolean): Promise<void>;

    /** Shows (unhides) items in the chart, making them visible.
    * @param id The ids of items to show.
    * @param showLinks If true then any hidden links to nodes which will become shown are also shown. Default: false.
    * @param options Options to control the show operation. */
    show(id: string | string[], showLinks?: boolean, options?: ShowOptions): Promise<void>;

    /** The toDataURL function returns a data URL of the chart image.
    * @param width The width of the required image in pixels. The default is the width of the chart element. Not supported in map mode.
    * @param height The height of the required image in pixels. The default is the height of the chart element. Not supported in map mode.
    * @param options Options to control how the image is created.
    * @returns A Promise with a base64 encoded PNG image string. */
    toDataURL(width?: number, height?: number, options?: ToDataURLOptions): Promise<string>;

    /** The unbind function detaches an event handler that was attached to it.
    * @param name The name of the event to be detached from, e.g., 'click'. You can also unbind multiple events in a single call, separating each with either a comma, space, or both, e.g. 'click, touchdown'.
    * @param handler The event handler that was supplied to the bind call. */
    unbind(name?: string, handler?: Function): void;

    /** The viewCoordinates function converts world coordinates (positions of items within the chart) to screen coordinates in the current view. This depends on the current view settings (zoom and pan). View coordinates are relative to the top left corner of the chart.
    * @param x The x position in world coordinates.
    * @param y The y position in world coordinates.
    * @returns The view coordinates.    */
    viewCoordinates(x: number, y: number): Coordinates;

    /** The viewOptions function sets the current chart view options, which covers the zoom setting and viewport location.
    * @param viewOptions Controls the view options.
    * @param transition Options to control the transition between view states.
    * @returns A Promise. */
    viewOptions(viewOptions: ViewOptionsUpdate, transition?: Transition): Promise<void>;

    /** The viewOptions function gets the current chart view options, which covers the zoom setting and viewport location. */
    viewOptions(): ViewOptions;

    /** worldCoordinates is a function for converting screen coordinates (in the current view) to the coordinates which are used to represent the position of items within the chart. This depends on the current view settings (zoom and pan).
    * @param x The position in screen pixel coordinates relative to the left side of the chart.
    * @param y The position in screen pixel coordinates relative to the top of the chart.
    * @returns An object {x: x, y: y} containing the world coordinates.    */
    worldCoordinates(x: number, y: number): Coordinates;

    /** Zoom the chart in the manner specified.
    * @param how Controls how to zoom the chart: 'fit': fit chart or specified ids to window, 'height': fit chart height or height of specified ids to window, or 'selection': fit selection to window.
    * @param options Options to control the zoom operation. */
    zoom(how: 'in' | 'out' | 'one' | 'fit' | 'height' | 'selection', options?: ZoomOptions): Promise<void>;

    /** Binding to the 'all' event captures all events that occur within the KeyLines chart. */
    bind(name: 'all', handler: ChartAllHandler): void;

    /** The click event is triggered when the user clicks on the chart surface. On touch devices this is triggered when the user touches the chart. */
    bind(name: 'click', handler: ChartClickHandler): void;

    /** The contextmenu event is triggered when the user right-clicks on the chart surface. On touch devices this is triggered when the user does a long press on the chart. */
    bind(name: 'contextmenu', handler: ChartContextmenuHandler): void;

    /** The dblclick event is triggered when the user double-clicks on the chart surface. On touch devices this is triggered when the user double-taps the chart. Default behaviour: Zoom in (animated) when double-clicking the background, or open or close a combo. Return true to override this behaviour. */
    bind(name: 'dblclick', handler: ChartDblclickHandler): void;

    /** The delete event is triggered when the user presses the delete key on the keyboard. The backspace key is not supported. Default behaviour: Removes the item from the chart. Return true to override this behaviour. */
    bind(name: 'delete', handler: ChartDeleteHandler): void;

    /** The dragcomplete event is fired after the default behaviour has been performed and everything is finished. Note that dragcomplete will still fire even if the default behaviour has been disabled. */
    bind(name: 'dragcomplete', handler: ChartDragcompleteHandler): void;

    /** The dragend event is fired just before a drag finishes. This event is designed to allow you to customise the behaviour of the drag result. Default behaviour: Complete the drag action. The precise behaviour depends on the nature of the drag. */
    bind(name: 'dragend', handler: ChartDragendHandler): void;

    /** The dragover event is fired by the 'move' drag type when dragging one item over another. */
    bind(name: 'dragover', handler: ChartDragoverHandler): void;

    /** The dragstart event is fired at the beginning of a drag. Unless panning the map, returning true from your event handler will prevent the default drag action occurring. The 'move' and 'hand' draggers, when not in map mode, allow you to control the drag operation by returning an object with the following properties: x (boolean) - whether dragging is allowed in the x-direction. The default is true. y (boolean) - whether dragging is allowed in the y-direction. The default is true. The 'move' dragger objects also support these properties: add (array) - an array of ids of items that will also be dragged, even if they are not selected. combos (boolean) - whether dragging nodes in combos also drags the combos. The default is true. */
    bind(name: 'dragstart', handler: ChartDragstartHandlerWithOptions): void;

    /** The dragstart event is fired at the beginning of a drag. Return true to prevent the default drag action. */
    bind(name: 'dragstart', handler: ChartDragstartHandler): void;

    /** The edit event is triggered when the user presses the F2 function button. Useful for offering label edit functionality. */
    bind(name: 'edit', handler: ChartEditHandler): void;

    /** The error event is fired when an error occurs inside the handler of another event. */
    bind(name: 'error', handler: ChartErrorHandler): void;

    /** The hover event is triggered when the mouse hovers over an item the specified time in the `hover` chart option. It is also triggered by dragging an external element over the chart (e.g. HTML5 drag and drop). */
    bind(name: 'hover', handler: ChartHoverHandler): void;

    /** The keydown event occurs as the user presses a key. Default behaviour: Various. Arrow keys move the selection, ctrl-A selects all, F2 raises edit event, and Del raises delete event. Return true to override this behaviour.
    * @param keyCode The keyCode of the key pressed. */
    bind(name: 'keydown', handler: ChartKeydownHandler): void;

    /** The map event is fired at the start and end of a map show or hide operation. */
    bind(name: 'map', handler: ChartMapHandler): void;

    /** The mousedown event occurs as the user presses a mouse button. Default behaviour: Intuitive select or deselect of items, depending on whether the mouse down occured on an item or the background, and whether the CTRL or SHIFT keys are pressed. Return true to override this behaviour. */
    bind(name: 'mousedown', handler: ChartMousedownHandler): void;

    /** The mousewheel event occurs as the user uses a mouse wheel or scrolls using a trackpad. Default behaviour: Zoom the chart in or out. Return true to override this behaviour. */
    bind(name: 'mousewheel', handler: ChartMousewheelHandler): void;

    /** The overview event is triggered when the user clicks on the overview icon. */
    bind(name: 'overview', handler: ChartOverviewHandler): void;

    /** The prechange event is triggered whenever the chart changes by either a user action, such as dragging items, or programmatically by calling API methods. */
    bind(name: 'prechange', handler: ChartPrechangeHandler): void;

    /** The progress event is triggered during long-running tasks such as layouts and centrality calculations. It will usually fire multiple times as the task progresses. */
    bind(name: 'progress', handler: ChartProgressHandler): void;

    /** The selectionchange event is triggered immediately after the user changes the selection by clicking or touching the chart surface. */
    bind(name: 'selectionchange', handler: ChartSelectionchangeHandler): void;

    /** The touchdown is triggered on touch devices when the user touches the chart surface. Default behaviour: Select an item if under the touch. Return true to override this behaviour. */
    bind(name: 'touchdown', handler: ChartTouchdownHandler): void;

    /** The viewchange event is fired after any view settings, such as zoom or pan, are changed This event is also fired when the view state is changed programmatically. Note that in map mode, viewchange is only fired at the end of a drag. */
    bind(name: 'viewchange', handler: ChartViewchangeHandler): void;

    /** You can bind multiple events in a single call, separating each either a comma, space, or both, e.g. 'click, touchdown'. */
    bind(name: string, handler: (...args: any[]) => void): void;
  }

  export type TimeBarAllHandler =
  /**
    * @param name The name of the event which was captured, e.g. 'click'. */
    (name: string, ...args: any[]) => boolean;

  export type TimeBarChangeHandler =
    () => void;

  export type TimeBarClickHandler =
  /**
    * @param type The reference of what was clicked: 'bar', 'selection', 'scale', (the time axis scale), 'histo' (the histogram area between the sliders), 'left' (the left slider), 'right' (the right slider), 'slider' (the areas outside the current slider range), 'controlbar' (the control bar at the bottom of the time bar), 'fit', 'previous', 'next', 'play', 'playextend', 'zoomin', 'zoomout', null (if there is nothing under the mouse).
    * @param index The index of the selection clicked on, or null for other click types.
    * @param value The value of either the bar or selection, or null for other click types.
    * @param x The centre of the bar or selection point.
    * @param y The height of the bar or selection point.
    * @param dt1 The date at the start of the clicked range.
    * @param dt2 The date at the end of the clicked range.
    * @param groupIndex Index of the clicked group within bar. Undefined if type parameter is not 'selection' or bar is marked.
    * @param groupValues Value of each group within bar. Undefined if type parameter is not 'selection' or bar is marked. */
    (type: string, index: number, value: number, x: number, y: number, dt1: Date, dt2: Date, groupIndex: number | undefined, groupValues: number[] | undefined) => void;

  export type TimeBarContextmenuHandler =
  /**
    * @param type The reference of what was clicked: 'bar', 'selection', 'scale', (the time axis scale), 'histo' (the histogram area between the sliders), 'left' (the left slider), 'right' (the right slider), 'slider' (the areas outside the current slider range), 'controlbar' (the control bar at the bottom of the time bar), 'fit', 'previous', 'next', 'play', 'playextend', 'zoomin', 'zoomout', null (if there is nothing under the mouse).
    * @param index The index of the selection clicked on, or null for other click types.
    * @param value The value of either the bar or selection, or null for other click types.
    * @param x A suggested location for the tooltip in the x direction - the centre of the bar or selection point.
    * @param y A suggested location for the tooltip in the y direction - the height of the bar or selection point.
    * @param dt1 The date at the start of the clicked range.
    * @param dt2 The date at the end of the clicked range.
    * @param groupIndex Index of the clicked group within bar. Undefined if type parameter is not 'selection' or bar is marked.
    * @param groupValues Value of each group within bar. Undefined if type parameter is not 'selection' or bar is marked. */
    (type: string, index: number, value: number, x: number, y: number, dt1: Date, dt2: Date, groupIndex: number | undefined, groupValues: number[] | undefined) => void;

  export type TimeBarDblclickHandler =
  /**
    * @param type The reference of what was clicked: 'bar', 'selection', 'scale', (the time axis scale), 'histo' (the histogram area between the sliders), 'left' (the left slider), 'right' (the right slider), 'slider' (the areas outside the current slider range), 'controlbar' (the control bar at the bottom of the time bar), 'fit', 'previous', 'next', 'play', 'playextend', 'zoomin', 'zoomout', null (if there is nothing under the mouse).
    * @param x The centre of the bar or selection point.
    * @param y The height of the bar or selection point. */
    (type: string, x: number, y: number) => boolean;

  export type TimeBarDragcompleteHandler =
  /**
    * @param type The type of drag.
    * @param x The x location of the drag.
    * @param y They y location of the drag. */
    (type: string, x?: number, y?: number) => void;

  export type TimeBarDragendHandler =
  /**
    * @param type The type of the drag: 'hand', 'left' or 'right'.
    * @param x The x location of the drag.
    * @param y They y location of the drag. */
  (type: string, x?: number, y?: number) => boolean;

  export type TimeBarDragstartHandler =
  /**
    * @param type The type of the drag: 'hand', 'left' or 'right'.
    * @param x The x location of the drag.
    * @param y They y location of the drag. */
    (type: string, x: number, y: number) => boolean;

  export type TimeBarEndHandler =
  /**
    * @param type The type of end reached, either 'data' or 'range'. */
    (type: string) => void;

  export type TimeBarErrorHandler =
  /**
    * @param message The message.
    * @param error The error object thrown. */
    (message: string, error: Error) => void;

  export type TimeBarHoverHandler =
  /**
    * @param type The reference of what was hovered over: 'bar', 'selection', 'scale', (the time axis scale), 'histo' (the histogram area between the sliders), 'left' (the left slider), 'right' (the right slider), 'slider' (the areas outside the current slider range), 'controlbar' (the control bar at the bottom of the time bar), 'fit', 'previous', 'next', 'play', 'playextend', 'zoomin', 'zoomout', null (if there is nothing under the mouse).
    * @param index The index of the selection hovered over, or undefined for other hover types.
    * @param value The value of either the bar or selection, or undefined for other hover types.
    * @param x A suggested location for the tooltip in the x direction - the centre of the bar or selection point.
    * @param y A suggested location for the tooltip in the y direction - the height of the bar or selection point.
    * @param dt1 The date at the start of the hovered range.
    * @param dt2 The date at the end of the hovered range.
    * @param groupIndex Index of the hovered group within bar. Undefined if type parameter is not 'selection' or bar is marked.
    * @param groupValues Value of each group within bar. . Undefined if type parameter is not 'selection' or bar is marked. */
    (type: string, index: number, value: number, x: number, y: number, dt1: Date, dt2: Date, groupIndex: number | undefined, groupValues: number[] | undefined) => void;

  export type TimeBarMousewheelHandler =
  /**
    * @param delta Abstract value describing how far the wheel 'turned'. The sign indicates the direction of the movement.
    * @param x The x location of the mouse cursor.
    * @param y The y location of the mouse cursor. */
    (delta: number, x: number, y: number) => boolean;

  export type TimeBarPauseHandler =
    () => void;

  export type TimeBarPlayHandler =
  /**
    * @param type The type of play mode, either 'extend' or 'normal'. */
  (type: string) => void;

  export type TimeBarStartHandler =
  /**
    * @param type The type of start reached, either 'data' or 'range'. */
    (type: string) => void;

  export type TimeBarTouchdownHandler =
  /**
    * @param type The reference of what was touched: 'bar', 'selection', 'scale', (the time axis scale), 'histo' (the histogram area between the sliders), 'left' (the left slider), 'right' (the right slider), 'slider' (the areas outside the current slider range), 'controlbar' (the control bar at the bottom of the time bar), 'fit', 'previous', 'next', 'play', 'playextend', 'zoomin', 'zoomout', null (if there is nothing under the mouse).
    * @param index The index of the selection touched on, or undefined for other touch types.
    * @param value The value of either the bar or selection, or undefined for other touch types.
    * @param x The centre of the bar or selection point.
    * @param y The height of the bar or selection point.
    * @param dt1 The date at the start of the touched range.
    * @param dt2 The date at the end of the touched range.
    * @param groupIndex Index of the touched group within bar. Undefined if type parameter is not 'selection' or bar is marked.
    * @param groupValues Value of each group within bar. Undefined if type parameter is not 'selection' or bar is marked. */
    (type: string, index: number, value: number, x: number, y: number, dt1: Date, dt2: Date, groupIndex: number | undefined, groupValues: number[] | undefined) => void;

  export interface SubItemInfo {
    subId: string;
    type: 'donut' | 'glyph' | 'halo' | 'bubble' | 'label' | 'resize' | 'arrowhead';
    linkEnd?: 't1' | 't2';
    index?: number;
  }

  export interface ItemInfo {
    /** id of the item */
    id: string;
    /** An object that describes how to retrive the correct "sub item" */
    subItemInfo?: SubItemInfo;
  }

  export interface TimeBar {
    /** Removes all data from the time bar. */
    clear(): void;

    /** Destroys the current instance of the time bar, freeing any allocated resources. */
    destroy(): void;

    /** The getIds function returns an array of the ids that have datetimes in the specified range.
    * @param dt1 The start of the required range of datetimes.
    * @param dt2 The end of the required range of datetimes.
    * @returns The ids that have datetimes in the specified range. */
    getIds(dt1: Date | number, dt2: Date | number): string[];

    /** The inRange function determines whether the item has a datetime either within the time bar's time range, or which overlaps any part of a time period in the range. Note that the item must have been loaded into the time bar.
    * @param item The item or id to range test.
    * @returns true if the specified item exists in the time bar and has a datetime that's either within the time range, or which overlaps any part of a time period, false otherwise. */
    inRange(item: TimeBarItem | string): boolean;

    /** Replaces the time bar data with the new data specified.
    * @param data The data to load into the time bar. */
    load(data: TimeBarData): Promise<void>;

    /** The mark function sets the time bar marks.
    * @param dts The timestamps to set marks on.
    * @returns The current mark list. */
    mark(dts?: Date | number | TimePeriod | (Date | number | TimePeriod)[]): (Date | number | TimePeriod)[];

    /** The mark function gets the time bar marks. */
    mark(): (Date | number | TimePeriod)[];

    /** Inserts new data into the time bar, merging it with any existing time bar data.
    * @param items The items to merge into the existing data. */
    merge(items: TimeBarItem[] | TimeBarData): Promise<void>;

    /** The options function gets options for the time bar. */
    options(): TimeBarOptions;

    /** The options function sets options for the time bar.
    * @param val The options to set for the time bar.
    * @returns The current time bar options. */
    options(val: TimeBarOptions): Promise<void>;

    /** Pan the time bar in the direction specified.
    * @param direction The direction to pan.
    * @param options Options controlling the pan operation. */
    pan(direction?: 'back' | 'forward', options?: TimeBarPanOptions): Promise<void>;

    /** The pause function stops the continuous animation of the time bar range started by `play()`. */
    pause(): void;

    /** The play function starts a continuous animation of the time bar range.
    * @param options Options controlling the play operation. */
    play(options?: TimeBarPlayOptions): void;

    /** The range function gets the time range of the time bar. */
    range(): TimeBarRangeResult;

    /** The range function sets the time range of the time bar.
    * @param dt1 The new start time for the time range of the time bar.
    * @param dt2 The new end time for the time range of the time bar.
    * @param options Options controlling the operation. */
    range(dt1: Date | number, dt2: Date | number, options?: TimeBarRangeOptions): Promise<void>;

    /** Remove item or items with the id(s) specified. Pass a single id to remove a single item, or an array of id strings to remove many items at once.
    * @param id The id string or array of id strings of items to remove. */
    removeItem(id: string | string[]): void;

    /** Gets the time bar selection lines. */
    selection(): (string[] | null)[];

    /** Sets the time bar selection lines.
    * @param items The items to be selected in the time bar.
    * @returns The current selections=. */
    selection(items: SelectionOptions | SelectionOptions[]): (string[] | null)[];

    /** Sets the location of the time bar on the page.  Set this to null to temporarily remove it.
    * @param element The id string or DOM element of the parent container that the time bar should be appended to. */
    setContainer(element: string | HTMLElement | null): void;

    /** The unbind function detaches an event handler that was attached to an event with bind.
    * @param name The name of the event to be detached from, e.g., 'click'. Separate multiple events with either a comma, space, or both, e.g. 'start, end'.
    * @param handler The event handler that was supplied to the bind call. */
    unbind(name?: string, handler?: Function): void;

    /** Zoom the time bar in the manner specified.
    * @param how How to zoom the time bar.
    * @param options Options controlling the zoom operation. */
    zoom(how?: 'in' | 'out' | 'fit', options?: TimeBarZoomOptions): Promise<void>;

    /** Binding to the all event will capture all events that occur within the KeyLines time bar. Return true to override the event's default behaviour. */
    bind(name: 'all', handler: TimeBarAllHandler): void;

    /** The change event is fired when the time range of the time bar changes. To get the new range, use the range function. This event is also fired when the time range is changed programmatically, but not if the change happens as a result of loading data that's outside the current range. */
    bind(name: 'change', handler: TimeBarChangeHandler): void;

    /** The click event is triggered by mouse clicks on the time bar. */
    bind(name: 'click', handler: TimeBarClickHandler): void;

    /** The contextmenu event is triggered by right-clicks on the time bar surface. */
    bind(name: 'contextmenu', handler: TimeBarContextmenuHandler): void;

    /** The dblclick event is triggered by mouse double-clicks on the time bar. On touch devices this is triggered when the user double-taps the time bar. Default behaviour: Zoom in (animated) when double-clicking anywhere except the control bar. Return true to override this behaviour. */
    bind(name: 'dblclick', handler: TimeBarDblclickHandler): void;

    /** The dragcomplete event is fired after the default behaviour has been performed and everything is finished. Note that dragcomplete will still fire even if the default behaviour has been disabled. */
    bind(name: 'dragcomplete', handler: TimeBarDragcompleteHandler): void;

    /** The dragend event is fired at the end of a drag. Default behaviour: finish the drag action. The precise behaviour depends on the nature of the drag. Return true to override this behaviour, making the drag snap back to its original position. */
    bind(name: 'dragend', handler: TimeBarDragendHandler): void;

    /** The dragstart event is fired at the beginning of a drag. Return true from your event handler to prevent the default drag action occurring. */
    bind(name: 'dragstart', handler: TimeBarDragstartHandler): void;

    /** The end 'data' event is triggered when the right slider reaches the last data point; the end 'range' event is triggered when the left slider reaches the last data point. */
    bind(name: 'end', handler: TimeBarEndHandler): void;

    /** The error event is fired when an error occurs inside the handler of another event. */
    bind(name: 'error', handler: TimeBarErrorHandler): void;

    /** The hover event is triggered by mouse hovers over the time bar.  */
    bind(name: 'hover', handler: TimeBarHoverHandler): void;

    /** The mousewheel event is triggered by mouse wheel or trackpad scrolls. Default behaviour: Zooms the time bar in or out. Return true to override this behaviour. */
    bind(name: 'mousewheel', handler: TimeBarMousewheelHandler): void;

    /** The pause event is triggered whenever the time bar stops playing , either by the user pressing the pause button or programmatically by calling `timebar.pause()`. It is also called when the time bar stops playing when it reaches the end of the range. */
    bind(name: 'pause', handler: TimeBarPauseHandler): void;

    /** The play event is triggered whenever the time bar starts to play. */
    bind(name: 'play', handler: TimeBarPlayHandler): void;

    /** The start 'data' event is triggered when the left slider reaches the first data point; the start 'range' event is triggered when the right slider reaches the first data point. */
    bind(name: 'start', handler: TimeBarStartHandler): void;

    /** The touchdown event is triggered by the user touching the time bar on a touch-enabled device. */
    bind(name: 'touchdown', handler: TimeBarTouchdownHandler): void;

    /** You can bind multiple events in a single call, separating each either a comma, space, or both, e.g. 'click, touchdown'. */
    bind(name: string, handler: (...args: any[]) => void): void;
  }

  export interface ComboInfoResult {
    /** Nodes in the combo. */
    nodes: Node[];
    /** Links in the combo. */
    links: Link[];
  }

  export interface Combo {
    /** Arrange the items within an open combo.
    * @param id The ids of the combos to be arranged.
    * @param options Options controlling the arrange operation.
    * @returns A Promise. */
    arrange(id: string | string[], options?: ComboArrangeOptions): Promise<void>;

    /** Closes the specified open combo/s, concealing the items inside.
    * @param ids The ids of the combos to be closed.
    * @param options Options controlling the close operation.
    * @returns A Promise. */
    close(ids: string | string[], options?: CloseOptions): Promise<void>;

    /** Combines nodes into a single 'combo' node. Any links between the nodes are no longer displayed.
    * @param comboDefinition A definition of the combo/s to create.
    * @param options Options controlling the combine operation.
    * @returns A Promise. */
    combine(comboDefinition: ComboDefinition | ComboDefinition[], options?: CombineOptions): Promise<string[]>;

    /** Finds the ids of the combos that contains the given items.
    * @param ids The ids of the items whose parents should be found.
    * @param options Options controlling how the find operates.
    * @returns The ids of the combos containing the given items, or null if not found. */
    find(ids: string[], options?: ComboFindOptions): (string | null)[];

    /** Finds the id of the combo containing the given item.
    * @param id The id of the item whose parent should be found.
    * @param options Options controlling how the find operates.
    * @returns The id of the combo containing the given item, or null if not found. */
    find(id: string, options?: ComboFindOptions): string | null;

    /** Finds every underlying node and link inside a combo or nest of combos, or null if the id is not a combo.
    * @param id The id of the combo.
    * @returns A catalogue of the ids of all underlying nodes and links. */
    info(id: string): ComboInfoResult | null;

    /** Tests node or link ids to find out whether they are combo nodes or combo links.
    * @param id The id/s of the items to be tested.
    * @param options Options controlling whether links or nodes are tested.
    * @returns True if any of the node or link id is a combo, false otherwise. */
    isCombo(id: string | string[], options?: IsComboOptions): boolean;

    /** Tests whether an item is an open combo.
    * @param id The id of the item to be tested.
    * @returns True if the item id is an open combo, false otherwise. */
    isOpen(id: string): boolean;

    /** Opens the specified combo/s so the contents are visible inside a combo border on the chart.
    * @param ids The id/s of the combos to be opened.
    * @param options Options controlling the open operation.
    * @returns A Promise. */
    open(ids: string | string[], options?: OpenOptions): Promise<void>;

    /** Sets which underlying links should be revealed.
    * @param ids The id/s of the links to be revealed.
    * @returns The currently revealed links. */
    reveal(ids?: string | string[]): string[];

    /** Gets a list of all revealed links. */
    reveal(): string[];

    /** Transfers the specified items into or out of a combo. Note: You must wait for the combine callback to be invoked before performing another chart function.
    * @param id The id/s of nodes to be transferred into or out of a combo.
    * @param comboId The id of the combo to transfer the items to, or null to transfer items out of the combo and onto the chart.
    * @param options Options controlling the transfer operation.
    * @returns A Promise. */
    transfer(id: string | string[], comboId: string | null, options?: TransferOptions): Promise<void>;

    /** Uncombines the specified combo nodes and combo links.
    * @param id The id/s of the combos to be uncombined.
    * @param options Options controlling the uncombine operation.
    * @returns A Promise. */
    uncombine(id: string | string[], options?: UncombineOptions): Promise<void>;
  }

  export interface Map {
    /** Hide the map that was displayed with the show function. Chart nodes with lat and lng  properties are repositioned as specified by the 'transition' option. The transition can be customised using `timebar.options()`.
    * @returns A Promise. */
    hide(): Promise<void>;

    /** Tests if the map is currently shown. */
    isShown(): boolean;

    /** Gives direct access to the underlying Leaflet map object that is used in map mode. */
    leafletMap(): any;

    /** Converts a set of view coordinates to the exact latitude and longitude.
    * @param x The x position in view coordinates.
    * @param y The y position in view coordinates.
    * @returns The geospatial coordinates of the specified point. */
    mapCoordinates(x: number, y: number): Location;

    /** Sets the options for the map.
    * @param val The options to set for the map.
    * @returns The current map options. */
    options(val: MapOptions): Promise<void>;

    /** Gets the options for the map. */
    options(): MapOptions;

    /** Display a map behind the chart. Chart nodes are positioned based on their `pos.lat` and `pos.lng` properties, rather than `x` and `y`. Nodes without `lat` and `lng` will not be shown. */
    show(): Promise<void>;

    /** Converts a set of latitude and longitude coordinates to the exact point in the view.
    * @param lat The latitude position of the point.
    * @param lng The longitude position of the point.
    * @returns The view coordinates of the specified point. */
    viewCoordinates(lat: number, lng: number): Coordinates;
  }

  export interface Graph {
    /** Calculates the betweenness centrality of all nodes in the graph.
    * @param options Options which define if the graph is directed, the result normalized and values associated with the links.
    * @returns An object whose properties are the ids of the nodes in the graph. The values are the betweenness values. */
    betweenness(options?: BetweennessOptions): Promise<IdMap<number>>;

    /** Clear removes all items from the graph engine. */
    clear(): void;

    /** Calculates the closeness centrality of all nodes in the graph.
    * @param options Options which define if the graph is directed, the result normalized and values associated with the links
    * @returns An object whose properties are the ids of the nodes in the graph. The values are the closeness values. */
    closeness(options?: ClosenessOptions): Promise<IdMap<number>>;

    /** Groups nodes in the graph into a set of clusters, and then returns an array describing them.
    * @param options Options which control how the calculation is done.
    * @returns An array [cluster1, cluster2, ...] where cluster1, cluster2... are arrays containing ids of nodes that are all in the same cluster. */
    clusters(options?: ClustersOptions): string[][];

    /** Finds the separate 'connected components' of the graph.
    * @param options Options which define special rules for items iteration.
    * @returns A catalogue of each distinct component and the items it contains. */
    components(options?: ComponentsOptions): ComponentsResult[];

    /** Calculates the degrees (number of links) of all nodes in the graph.
    * @param options Options which define the direction and values associated with the links
    * @returns An object whose properties are the ids of the nodes, the values of which are the degree values. */
    degrees(options?: DegreesOptions): IdMap<number>;

    /** Calculates the distances of all nodes from the node specified. The distance is the number of edges in a shortest path.
    * @param id The id of the node to start from.
    * @param options Options for the direction and values associated with the paths.
    * @returns An object whose properties are the ids of the nodes and values are the distances. */
    distances(id: string, options?: DistancesOptions): IdMap<number>;

    /** Calculates the eigenvector centrality of each node.
    * @param options Options which define special rules for the eigenCentrality computation.
    * @returns An object listing the eigenvector centrality of each node. */
    eigenCentrality(options?: EigenCentralityOptions): IdMap<number>;

    /** Calculates subgraphs of the graph where each node has a degree of at least k. It works by successively removing nodes of degree less than k until no further nodes can be removed.
    * @param options Options which define special rules for items iteration.
    * @returns An object which describes the kCores found. */
    kCores(options?: KCoresOptions): KCoresResult;

    /** Replaces the graph data with the new data specified.
    * @param data The data to load into the graph engine. */
    load(data: ChartData): void;

    /** Finds neighbours (linked items) to the id/s passed in.
    * @param id The id/s of the item/s whose neighbours should be found
    * @param options Options which define special rules for items iteration.
    * @returns A catalogue of the neighbours of the items specified. */
    neighbours(id?: string | string[], options?: NeighboursOptions): NeighboursResult;

    /** Calculates the PageRank of each node.
    * @param options Options which define special rules for PageRank computation.
    * @returns An object containing the PageRank of each node. */
    pageRank(options?: PageRankOptions): IdMap<number>;

    /** Calculates all the shortest paths between the nodes specified.
    * @param id1 The id of the starting node on the path.
    * @param id2 The id of the ending node on the path.
    * @param options Options for the direction and values associated with the paths.
    * @returns An object which describes the path structure. */
    shortestPaths(id1?: string, id2?: string, options?: ShortestPathsOptions): ShortestPathsResult;
  }

  export interface KeyLines {
    /** The components object has all the current components loaded by the KeyLines wrapper. */
    components: IdMap<(Chart | TimeBar)>;

    /** Calculates the coordinates of events relative to their target.
    * @param evt A DOM or jQuery event.
    * @returns An object whose properties 'x' and 'y' are the coordinates in 'target space'. */
    coords(evt: Event): Coordinates;

    /** **DEPRECATED** Creates a KeyLines Chart in your web page in the HTML element with the given id.
    * @param id The id of the HTML element to replace with the Chart.
    * @returns A promise with the created Chart. */
    create(id?: string): Promise<Chart>;

    /** **DEPRECATED** Creates a KeyLines Chart in your web page in the DOM element provided.
    * @param element The DOM element to replace with the Chart.
    * @returns A promise with the created Chart. */
    create(element?: HTMLElement): Promise<Chart>;

    /** Creates a KeyLines component in your web page using an object defining the component.
    * @param component The definition object for the component.
    * @returns A promise with the created component. */
    create(component: Component): Promise<Chart | TimeBar>;

    /** Creates KeyLines components in your web page using the objects supplied, defining the components.
    * @param components An array containing definition objects for the components.
    * @returns A promise with the created component. */
    create(components: Component[]): Promise<(Chart | TimeBar)[]>;

    /** **DEPRECATED** Use dashedLineSupport to discover whether the current browser can draw dashed lines. */
    dashedLineSupport(): boolean;

    /** Tests if the current browser can show elements full screen. */
    fullScreenCapable(): boolean;

    /** Finds the right character to use for the icon based on the class name.
    * @param classes The class names required to get the font icon.
    * @returns The reference for the font icon. */
    getFontIcon(classes: string): number;

    /** The Graph engine can be used to perform traversals or other graph computations within a separate context from the chart.
    * @param options Options for the graph engine.
    * @returns A new instance of the graph engine used by KeyLines. */
    getGraphEngine(options?: GraphEngineOptions): Graph;

    /** Gives useful information about your KeyLines including version number. */
    info(): any;

    /** Defines which runtime KeyLines will use when calling `KeyLines.create()`.
    * @param value The mode to use.
    * @returns The current mode. */
    mode(value: 'auto' | 'webgl' | 'canvas'): string;

    /** The paths function tells KeyLines where it can find various resources on your server.
    * @param value An object specifying the path to the image resources.
    * @returns An object containing the current path settings. */
    paths(value: PathsOptions): any;

    /** Makes the KeyLines API promise-aware.
    * @param Promise A valid Promise A/A+ constructor. By default, it'll use ES6 native promises if your browser supports it. */
    promisify(Promise?: PromiseConstructor): void;

    /** For charts without a defined 'component' property in their `create()` method, must be called when you change the size of the component.
    * @param id The id of the component element.
    * @param width The new width in pixels. Must be greater than 0.
    * @param height The new height in pixels. Must be greater than 0. */
    setSize(id: string, width: number, height: number): void;

    /** For charts without a defined 'component' property in their `create()` method, must be called when you change the size of the component.
    * @param element The HTMLElement of the component.
    * @param width The new width in pixels. Must be greater than 0.
    * @param height The new height in pixels. Must be greater than 0. */
    setSize(element: HTMLElement, width: number, height: number): void;

    /** Puts the given HTMLElement in Full Screen mode, using the browser's full screen API.
    * @param element The element to be put in full screen. Cannot be null.
    * @param handler A callback function which will be called once the operation is complete. */
    toggleFullScreen(element: HTMLElement, handler?: Function): void;

    /** Checks if the current device supports WebGL and meets the minimum requirements. */
    webGLSupport(): boolean;
  }
}

// eslint-disable-next-line no-redeclare
declare const KeyLines: KeyLines.KeyLines;

export = KeyLines;
