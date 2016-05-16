
fis.match('/*.sh', {
  release: false
});

// 字体 f
fis.match('/f/**', {
  release: '/$0'
});
// 公共部分 h
fis.match('/h/*.html', {
  isHtmlLike: false,
  release: false
});
// 图片 i
fis.match('/i/*.{png,jpg,jpeg,gif}', {
  release: '/$0'
});
// javascript j
fis.match('/j/*.js', {
  release: '/$0'
});
// less
fis.match('l/(*).less',{
  parser: fis.plugin('less'),
  rExt: '.css',
  release: '/c/$1'
});
// 雪碧图设置
fis.match('::packager', {
  spriter: fis.plugin('csssprites', {
    scale: 1,
    margin: 30
  })
})
// 对CSS进行图片合并
fis.match('l/(*).less', {
  useSprite: true
});
// 把雪碧图发布到i
fis.match('/l\/(*).png', {
  useHash: false,
  release: '/i/$1.png'
});
// 页面 html
fis.match('**.html',{
  release: '/$0'
});


//使用方法 fis3 release prod
// 使用相对路径
fis.hook('relative');
fis.media('prod')
  .match('s/(**).js', {
    optimizer: fis.plugin('uglify-js'),
    release: '/s/$1'
  })
  .match('l/(*).less', {
    optimizer: fis.plugin('clean-css'),
    parser: fis.plugin('less'),
    rExt: '.css',
    release: '/c/$1'
  }).match('/l\/(*).png', {
    release: '/i/$1.png'
  }).match('/i/(**).{png,jpg,jpeg,gif}', {
    release: '/$0'
  }).match('**.png', {
    optimizer: fis.plugin('png-compressor')
  }).match('**.{js,css,less,png}', {
    // useHash: true
  }).match('**', { 
    relative: true 
  }).match('**', {
    // domain: 'file:///Users/njy/workspace/github/euro/'
  });
  // fis.match('**.html', {
  //   optimizer: fis.plugin('htmlmin')
  // });