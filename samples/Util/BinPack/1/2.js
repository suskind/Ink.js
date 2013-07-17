Ink.requireModules(
    ['Ink.Util.BinPack_1', 'Ink.Util.Image_1'],
    function(IBP, IImg) {

    var maxDims = [196, 196];

    var images = [
        'http://c1.quickcachr.fotos.sapo.pt/i/N0b06923f/7827051_n7inO.jpeg',
        'http://c2.quickcachr.fotos.sapo.pt/i/Naf061958/8480252_Sd33o.jpeg',
        'http://c2.quickcachr.fotos.sapo.pt/i/N9914990f/15197649_9BlHZ.jpeg',
        'http://c2.quickcachr.fotos.sapo.pt/i/Nde04b050/5608816_Gmqk5.jpeg',
        'http://c6.quickcachr.fotos.sapo.pt/i/Ndb14b4ac/15122864_dVdeQ.jpeg',
        'http://c7.quickcachr.fotos.sapo.pt/i/Ne5077eb5/9304185_40lh6.jpeg',
        'http://c9.quickcachr.fotos.sapo.pt/i/N4b13f127/15223011_oJRm1.jpeg',
        'http://c10.quickcachr.fotos.sapo.pt/i/Nee13e64a/15220615_ivRzB.jpeg',
        'http://c10.quickcachr.fotos.sapo.pt/i/Nc014e335/15184204_NZpz2.jpeg',
        'http://c9.quickcachr.fotos.sapo.pt/i/N30010a8c/5277608_5GCUH.jpeg',
        'http://c4.quickcachr.fotos.sapo.pt/i/N8e071a3e/9842544_Adbu8.jpeg',
        'http://c7.quickcachr.fotos.sapo.pt/i/Nf2147ff3/15184466_1H3vA.jpeg',
        'http://c5.quickcachr.fotos.sapo.pt/i/N061381ba/15235485_uP0RB.jpeg',
        'http://c2.quickcachr.fotos.sapo.pt/i/N67021741/2152481_5C8TL.jpeg',
        'http://c5.quickcachr.fotos.sapo.pt/i/Ncf139f2d/15195395_UMqYS.jpeg',
        'http://c3.quickcachr.fotos.sapo.pt/i/N8414e445/15195267_fYuSS.jpeg',
        'http://c10.quickcachr.fotos.sapo.pt/i/Na013efbc/15191634_vqzBD.jpeg',
        'http://c6.quickcachr.fotos.sapo.pt/i/N15012dc1/6249604_MUEdS.jpeg',
        'http://c5.quickcachr.fotos.sapo.pt/i/N5b14aebb/15223009_UTbCm.jpeg'
    ];

    IImg.measureImages(images, function(o) {
        // create image blocks
        var uri, dims, dims2, images = [];
        for (uri in o.measured) {
            dims = o.measured[uri];
            dims2 = IImg.maximizeBox(maxDims, dims)[0];
            images.push({
                uri: uri,
                dims: dims,
                w: dims2[0],
                h: dims2[1]
            });
        }



        // apply bin pack...
        var r = IBP.binPack({
            blocks: images
            //dimensions: [512, 512],
            //sorter: 'width'
        });



        // display stuff...
        var ctnEl = Ink.i('ctn');
        var st = ctnEl.style;
        st.width  = r.dimensions[0] + 'px';
        st.height = r.dimensions[1] + 'px';

        var i, f, img, imgEl;
        for (i = 0, f = r.fitted.length; i < f; ++i) {
            img = r.fitted[i];
            imgEl = document.createElement('image');
            imgEl.setAttribute('width',  img.w);
            imgEl.setAttribute('height', img.h);
            st = imgEl.style;
            st.left = img.fit.x + 'px';
            st.top  = img.fit.y + 'px';
            imgEl.src = img.uri;
            ctnEl.appendChild(imgEl);
        }

        if (r.unfitted.length) {
            alert('Unfitted: ' + r.unfitted.length);
        }

    });

});
