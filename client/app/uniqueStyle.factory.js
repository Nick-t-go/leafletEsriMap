app.factory('uStyle', function() {

    setFields = function(featureLayer, fields, tblField){
        featureLayer.fields = fields;
        featureLayer.tblField = tblField;
    }

    return {


        horizontalQualityStyle:function(feature){
            console.log(feature)
                var c, o = 0.75;
                switch (feature.properties.FkMhHorizontalQuality) {

                    case 'SURVEY':
                        c = '#ffff00';
                        o = 1;
                        break;
                    default:
                        // console.log(feature.properties.FkMhHorizontalQuality);
                        c = '#FF5400';
                }
                return { color: c, opacity: o, weight: .5 };
            },

        horizontalQuality: function(featureLayer, func) {
            setFields(featureLayer, [{name: 'SURVEY',color: '#ffff00', opacity:0.75, weight: .5},
                                {name: 'other', color:'#FF5400', opacity:0.75, weight: .5}],
                                'horizontalQuality')
            featureLayer.setStyle(func);
        },


        dPsSewerDistrictStyle: function(feature){
                var c, o = 0.75;
                switch (feature.properties.dCountyResponsible) {
                    case 'N':
                        c = '#FFAA00';
                        break;
                    case 'Y':
                        c = '#005CE6';
                        break;
                }
                return { color: c, opacity: o, weight: .5, 'z-index':500  };
            },

        dPsSewerDistrict: function(featureLayer, func) {
            setFields(featureLayer, [{name: 'N',color: '#FFAA00',opacity:0.75},
                                {name: 'Y', color:'#005CE6', opacity:0.75}],
                                'dPsSewerDistrict')
            featureLayer.setStyle(func);
        },



        subTypeStyle: function(feature){
                var c, o = 0.75;
                switch (feature.properties.PipeSubType) {
                    case 1: //Force Main
                        c = '#996600';
                        break;
                    case 0: //Gravity
                        c = '#33ff00';
                        break;
                    case 2: //Outfall
                        c = '#0066ff';
                        break;
                }
                return { color: c, opacity: o, weight: .5};
            },


        subType: function(featureLayer, func) {
            setFields(featureLayer, [{name:'Force Main',color: '#996600',opacity:0.75, weight: .5},
                                {name: 'Gravity', color:'#33ff00', opacity:0.75, weight: .5},
                                {name: 'Outfall', color:'#0066ff', opacity:0.75, weight: .5}],
                                'subType')
            featureLayer.setStyle(func);
        }
    }
})
