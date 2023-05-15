module.exports = function (api) {
    const isTest = api.env('test');
    if (!isTest) {
        return null;
    }

    api.cache(true);
  
    const presets = [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current',
                },
            }
        ],
    ];
    const plugins = ["dynamic-import-node"];
  
    return {
        presets,
        plugins
    };
}