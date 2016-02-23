

var SquareTile = cc.Sprite.extend({
  type: 0,
  ctor:function(type) {
    this._super();
    this.type = type;


    this.initWithFile(res.s0.replace("0",type));
    console.log(res.s0.replace("0",type));
  }
});


var HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    matrixStatus: [[]],
    matrixVisited: [[]],
    numRows: 10,
    numColumns: 10,
    cellSize: {w:30, h:30},
    matrixColor : [ cc.color(0xFF,0,0,0xFF), cc.color(0x00,0xFF,0x00,0xFF) ,cc.color(0x00,0x00,0xFF,0xFF), cc.color(0xFF,0xFF,0x00,0xFF), cc.color(0xFF,0,0xFF,0xFF)  ],
    gridPosition: cc.p(300,400),
    numMovements: 0,
    level: 0,
    colors: 0,

    ctor:function (level, colors)
    {
        //////////////////////////////
        // 1. super init first
        this._super();

        this.level = level;
        this.colors = colors;
        cc.log("LEVEL " + this.level);

        this.numRows = this.level;
        this.numColumns = this.level;

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        var size = cc.winSize;
        var self = this;
        this.gridPosition = cc.p( ( size.width / 2 ) - ( ( this.numColumns / 2 ) * this.cellSize.w ) , (size.height / 2) + (( this.numRows / 2  ) * this.cellSize.h ));



		var bgGradient = new cc.LayerGradient(cc.color(0,0,0,255), cc.color(0x46,0x82,0xB4,255));
		this.addChild(bgGradient);

    var s = new SquareTile(1);
    this.addChild(s);
    s.x = 50;
    s.y = 200;

        /////////////////////////////
        // 3. add your codes below...
        // add a label shows "Hello World"
        // create and initialize a label
        this.lblMovements  = new cc.LabelTTF("Movements: 0", "Arial", 14);

        this.lblMovements.setName("lblMovements");

        // position the label on the center of the screen
        this.lblMovements.x = size.width / 2;
        this.lblMovements.y = size.height / 2 + 200;

        var listener1 = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            // When "swallow touches" is true, then returning 'true' from the onTouchBegan method will "swallow" the touch event, preventing other listeners from using it.
            swallowTouches: false,

            //Process the touch end event
            onTouchEnded: function (touch, event) {


            },

            onTouchBegan: function (touch, event) {
                // event.getCurrentTarget() returns the *listener's* sceneGraphPriority node.
              
                if ( event.getCurrentTarget().getName()  == self.lblMovements.getName() )
                {
                    cc.log( touch.getLocation() );
                    self.prepareGame();
                }
            }
        });



        cc.eventManager.addListener(listener1,  this.lblMovements);

//        this.lblMovements.addTouchEventListener(function(sender, type)
//        {
//            if ( ccui.Widget.TOUCH_ENDED == type )
//            {
//                self.prepareGame();
//            }
//
//
//        }, this);

        // add the label as a child to this layer
        this.addChild(this.lblMovements , 5);



        //Create drawing
        this.drawNode = new cc.DrawNode();
        this.addChild(this.drawNode);


        this.prepareGame();



         cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed:function(key, event) {
                cc.log("KEY " + key);

                var step;

                step = key - 49;

                if ( step > self.matrixColor.length )
                {
                    return;
                }
                self.doStep(step);

            },
            onKeyReleased:function(key, event) {

            }
        }, this);


        //Draw indicators
        var matrixColor = [[0,1,2,3]];


        //this.drawGrid( this.drawNode, cc.p(100,50) , {w: 20, h: 20} , 4, 1   );
        //this.paintStatus(this.drawNode,  matrixColor, cc.p(100,50) ,  {w: 50, h: 50} );

        for ( var i = 1; i <= this.colors; i++)
        {
            cc.log("Label " + i);
            var  l  = new cc.LabelTTF("", "Arial", 38);
            // position the label on the center of the screen
            l.x = 125 + ((i-1) * 50);
            l.y = 25;
            // add the label as a child to this layer

            this.addChild(l, 6);

            var button = new ccui.Button();
            button.setTouchEnabled(true);
            button.loadTextures(res.s0.replace("0",i-1), res.buttonPush, "");
            button.x = l.x ;
            button.y = l.y ;
            button.setTitleText(i);
            button.setTitleFontSize(38);
            button.setContentSize( 50,50 );
            button.addTouchEventListener(this.touchEvent, this);



            this.addChild(button,7);


        }


        var buttonStart = new ccui.Button(res.button1_small, res.button2_small, "");
        buttonStart.setName("btnStart");
        buttonStart.setTouchEnabled(true);
        buttonStart.x = size.width - 150;
        buttonStart.y = 20;
        buttonStart.addTouchEventListener(this.touchEvent, this);

        var lblStart = new cc.LabelTTF("Return");
        lblStart.x = size.width - 150;
        lblStart.y = 20;






        this.addChild(buttonStart);
        this.addChild(lblStart);



        return true;
    },

    prepareGame: function()
    {
        this.matrixVisited = new Array( this.numRows );
        for( var i = 0; i < this.numColumns; i++)
        {
            this.matrixVisited[i] = new Array( this.numRows );
            for ( var j = 0; j < this.numRows; j++)
            {
                this.matrixVisited[i][j] = 0;
            }
        }



        this.matrixVisited[0][0] = 1;

//        this.drawNode.drawSegment(cc.p(50,50), cc.p(200,200),2);
        this.drawGrid( this.drawNode, this.gridPosition , this.cellSize, this.numColumns, this.numRows   );




        this.matrixStatus = new Array( this.numRows );
        this.fillRandom(this.matrixStatus, this.numRows, this.numColumns, this.colors);

        this.paintStatus(this.drawNode,  this.matrixStatus, this.gridPosition , this.cellSize );
		this.numMovements = 0;
		this.lblMovements.setString("Movements: " + this.numMovements );
    },

    doStep: function(step)
    {

        var self = this;
        self.numMovements++;

        self.lblMovements.setString("Movements: " + self.numMovements );

        var status =  self.step( self.matrixStatus, self.matrixVisited, step );

        self.matrixStatus = status.status.slice(0);
        self.matrixVisited = status.visited.slice(0);

        self.paintStatus(self.drawNode,  self.matrixStatus, self.gridPosition , self.cellSize );
        if ( status.won === true)
        {
            self.lblMovements.setString("WIN with movements: " + self.numMovements + "\nClick me for new game" );
        }
    },

    touchEvent: function (sender, type)
    {
        if ( ccui.Widget.TOUCH_ENDED == type )
        {
          if( sender.getName() == "btnStart" )
          {
              cc.director.runScene(new WelcomeScene());
          }else {
            this.doStep( parseInt(sender.getTitleText(), 10) -1 );
          }

        }
    },

    drawGrid: function( drawNode, position ,cellSize, numColumns, numRows  )
    {
        //drawRect(origin, destination, fillColor, lineWidth, lineColor)
        cc.log("cellSize " + JSON.stringify(cellSize) );

        cc.log("Origion: " + JSON.stringify(position) );

        var destination = cc.p( position.x + ( cellSize.w * numColumns) , position.y - ( cellSize.h * numRows ) );

        cc.log("Destination: " + JSON.stringify(destination) );

        //drawNode.drawRect( position, destination, 1, 1, 2 );

        for( var i = 0; i < numColumns; i++)
        {
            var x1 = position.x + i*cellSize.w;
            var y1 = position.y;


            var y2 = position.y - cellSize.h * numRows;


          //  drawNode.drawSegment( cc.p( x1, y1 ), cc.p( x1, y2 ), 1   );

            for( var j = 0; j < numRows; j++)
            {
                x1 = position.x;
                y1 = position.y - j * cellSize.h;

                x2 = position.x + numColumns * cellSize.w;

                //drawNode.drawSegment( cc.p( x1, y1 ), cc.p( x2, y1 ), 1   );
            }

        }

    },

    fillRandom: function( matrixStatus, numRows, numColumns , totalColors)
    {
        var min = 0;
        var max = totalColors-1;




        for (var i = 0 ; i < numRows; i++)
        {
            matrixStatus[ i ] = new Array(numColumns);
            for (var j = 0; j < numColumns; j++)
            {
                matrixStatus[i][j] = Math.floor(Math.random() * (max - min + 1)) + min;

            }
        }

        cc.log(matrixStatus);
    },

    paintStatus: function( drawNode, matrixStatus, position,  cellSize )
    {


        //drawRect(origin, destination, fillColor, lineWidth, lineColor)
        for(var i = 0; i < matrixStatus.length; i++ )
        {
            for( var j = 0; j < matrixStatus[i].length; j++)
            {
                var x1 = position.x + j*cellSize.w;
                var x2 = x1 + cellSize.w;

                var y1 = position.y - i*cellSize.h;
                var y2 = y1 - cellSize.h;

                cc.log("Rectangle [" + i + ", " + j + "] color " + matrixStatus[i][j]  );
                cc.log("Pos " +  JSON.stringify(cc.p( x1, y1 ))  + " ~ " +  JSON.stringify(cc.p(x2,y2)) );



                var sT = new SquareTile( matrixStatus[i][j] );
                sT.scale = 0.65;
                sT.x = x1;
                sT.y = y1;

                this.addChild(sT);

//                drawNode.drawRect( cc.p( x1, y1 ) , cc.p(x2,y2), this.matrixColor[matrixStatus[i][j]] , 0, 0);



            }
        }


    },

    step: function( matrixStatus, matrixVisited, nextColor )
    {


        for( var i = 0 ; i < matrixVisited.length; i++ )
        {
            for ( var j = 0 ; j < matrixVisited[i].length; j++)
            {
                if ( matrixVisited[i][j] === 1 )
                {
                    matrixStatus[i][j] = nextColor;
                }
            }
        }

        var mustCheck = true;
        var hasWon = true;

        while ( true === mustCheck )
        {

            mustCheck = false;
            var cpyMatrixVisited = matrixVisited.slice(0);
            var cpyMatrixStatus  = matrixStatus.slice(0);




            for( var i = 0 ; i < matrixVisited.length; i++ )
            {
                for ( var j = 0 ; j < matrixVisited[i].length; j++)
                {
                    if( matrixVisited[i][j] === 1 )
                    {
                        if ((( i +1 ) < matrixStatus.length) && ( matrixVisited[i+1][j] === 0  ))
                        {
                            if ( matrixStatus[i+1][j] === matrixStatus[i][j] )
                            {
                                //Same color
                                cpyMatrixVisited[i+1][j] = 1;
                                mustCheck = true;
                            }
                        }

                        if ((( j +1 ) < matrixStatus[i].length) && ( matrixVisited[i][j+1] === 0  ))
                        {
                            if ( matrixStatus[i][j+1] === matrixStatus[i][j] )
                            {
                                //Same color
                                cpyMatrixVisited[i][j+1] = 1;
                                mustCheck = true;
                            }
                        }

                        if ((( i +1 ) < matrixStatus.length) && ( (j+1) < matrixStatus[i].length ) && ( matrixVisited[i+1][j+1] === 0  ))
                        {
                            if ( matrixStatus[i+1][j+1] === matrixStatus[i][j] )
                            {
                                //Same color
                                cpyMatrixVisited[i+1][j+1] = 1;
                                mustCheck = true;
                            }
                        }

                        if (( ( i-1 ) > 0) && (  (j-1) > 0 ) && ( matrixVisited[i-1][j-1] === 0  ))
                        {
                            if ( matrixStatus[i-1][j-1] === matrixStatus[i][j] )
                            {
                                //Same color
                                cpyMatrixVisited[i-1][j-1] = 1;
                                mustCheck = true;
                            }
                        }

                        if (( ( i-1 ) > 0) && ( matrixVisited[i-1][j] === 0  ))
                        {
                            if ( matrixStatus[i-1][j] === matrixStatus[i][j] )
                            {
                                //Same color
                                cpyMatrixVisited[i-1][j] = 1;
                                mustCheck = true;
                            }
                        }

                        if (( ( j-1 ) > 0) && ( matrixVisited[i][j-1] === 0  ))
                        {
                            if ( matrixStatus[i][j-1] === matrixStatus[i][j] )
                            {
                                //Same color
                                cpyMatrixVisited[i][j-1] = 1;
                                mustCheck = true;
                            }
                        }
                    }else
                    {
                        hasWon = false;
                    }
                    matrixStatus = cpyMatrixStatus.slice(0);
                    matrixVisited = cpyMatrixVisited.slice(0);
                }
            }

        }

        return{ status: matrixStatus, visited: matrixVisited, won: hasWon };


    }

});

var HelloWorldScene = cc.Scene.extend({
    level: 6,
    colors: 4,
    ctor: function(level,colors)
    {
      this._super();
      this.level = level;
      this.colors = colors;
      console.log(level, " " , colors);
    },
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer(this.level, this.colors);
        this.addChild(layer);
    }
});
