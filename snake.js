"use strict";

/****
 * Snake
 * @author Anthony gasca
 */

/**
 *  SNAKE - version 2022 pour les L3 INFO
 */
document.addEventListener("DOMContentLoaded", function() {

    /** Récupération des informations liées au canvas */
    let canvas = document.getElementById("cvs");
    const WIDTH = canvas.width = window.innerWidth;
    const HEIGHT = canvas.height = window.innerHeight;
    let ctx = canvas.getContext("2d"); 


    /**
     * Class representing a snake
     */    
    class Snake {
        
        /**
         * Create a snake.
         */
        constructor(size, speed, positionX, positionY, directionX, directionY, lengthMax) {
            this.size = size; // thickness of snake
            this.speed = speed;
            this.direction = {x: directionX, y: directionY};
            this.segments = [{x: positionX, y: positionY}, {x: positionX, y: positionY}];
            this.lengthMax = lengthMax; // length max allowed of serpent
            this.alive = true;
        }

        /**
         * draw snake in the canvas 
         */
        draw() {
            //body
            ctx.strokeStyle = "#E0E0E0";
            ctx.lineWidth = this.size;
            ctx.lineCap = ctx.lineJoin = "round";
        
            ctx.beginPath();
            
            // draw the segment to represent body snake
            for (let p = 0; p < this.segments.length-1; p++) {
                ctx.moveTo(this.segments[p].x, this.segments[p].y)
                ctx.lineTo(this.segments[p+1].x, this.segments[p+1].y);            
            }

            ctx.closePath();
            ctx.stroke();

            //eyes
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(this.segments[0].x + this.direction.y*(this.size/5), this.segments[0].y + this.direction.x * (this.size/5), 
                                                                                this.size/10, 0, 2*Math.PI);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.arc(this.segments[0].x - this.direction.y * (this.size/5), this.segments[0].y - this.direction.x * (this.size/5), 
                                                                                this.size/10, 0, 2*Math.PI);
            ctx.closePath();
            ctx.fill(); 

            //tongue
            let posHead = {x: this.segments[0].x + (this.size/1.7) * this.direction.x, 
                                y: this.segments[0].y + (this.size/1.7) * this.direction.y}; 
            ctx.strokeStyle = "red";
            ctx.lineWidth = this.size/7;
            ctx.beginPath();
            ctx.rect(posHead.x, posHead.y, this.direction.x * (this.size/3), this.direction.y * (this.size/3));
            ctx.moveTo(posHead.x + this.direction.x * (this.size/3), posHead.y + this.direction.y * (this.size/3));
            ctx.lineTo(posHead.x + this.direction.x * (this.size/2) + this.direction.y * (this.size/5), 
                                posHead.y + this.direction.y * (this.size/2) + this.direction.x * (this.size/5));
            ctx.moveTo(posHead.x + this.direction.x * (this.size/3), posHead.y + this.direction.y * (this.size/3));
            ctx.lineTo(posHead.x + this.direction.x * (this.size/2) - this.direction.y * (this.size/5), 
                                posHead.y + this.direction.y * (this.size/2) - this.direction.x * (this.size/5));
            ctx.closePath();
            ctx.stroke();      
        }

        /**
         * Move the snake a distance represented by the speed of the snake and the delta time (dt)
         * @param {*} dt the delta time
         */
        move(dt) {
            //move head snake
            this.segments[0].x += this.direction.x * dt * this.speed;
            this.segments[0].y += this.direction.y * dt * this.speed;

            // cacul length of the snake
            let length = 0;
            for (let p = 0; p < this.segments.length-1; p++) {
                length += distance(this.segments[p].x, this.segments[p].y, this.segments[p+1].x, this.segments[p+1].y);
            }
            //console.log(length)
            
            // move tail snake if too big
            if(length > this.lengthMax) {
                let diffX = this.segments[this.segments.length-2].x - this.segments[this.segments.length-1].x;
                let diffY = this.segments[this.segments.length-2].y - this.segments[this.segments.length-1].y;
                let d = Math.sqrt(Math.pow(diffX, 2)+Math.pow(diffY, 2)); // represent length of last segment snake

                if(dt * this.speed > d) { // last segment is too small
                    this.segments.pop();
                    diffX = this.segments[this.segments.length-2].x - this.segments[this.segments.length-1].x;
                    diffY = this.segments[this.segments.length-2].y - this.segments[this.segments.length-1].y;
                }else { // last segment is big enough
                    d = 0;
                }

                // case of the 4 directions of the tail
                if (diffX > 0) { // snake go to right
                    this.segments[this.segments.length-1].x += (dt * this.speed - d);
                }else if(diffX < 0) { // snake go to left
                    this.segments[this.segments.length-1].x -= (dt * this.speed -d);
                }
                
                if(diffY > 0) { // snake go to bottom
                    this.segments[this.segments.length-1].y +=  (dt * this.speed -d);
                }else if(diffY < 0) { // snake go to top
                    this.segments[this.segments.length-1].y -=  (dt * this.speed - d);
                }
            }
        }
    }
    
    /**
     * Class representing a fruit
     */    
    class Fruit {
        /**
         * create a fruit
         * @param {*} size // thickness of the fruit
         * @param {*} gain // represents the length that the snake will gain if it eats the fruit
         */
        constructor(size, gain) {
            this.size = size;
            this.gain = gain;
            this.position = {x: 0, y: 0}; // center of the fruit
            this.place(); // place the fruit randomly in the window
        }

        /**
         * draw the fruit
         */
        draw() {             
            ctx.fillStyle = "yellow";
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size, 0, 2*Math.PI);
            ctx.closePath();
            ctx.fill(); 
        }
        
        /**
         * place the fruit randomly in the window as long 
         * as the fruit is not in contact with the body of the snake
         */
        place() {
            do { 
                this.position.x = Math.floor(Math.random() * (WIDTH - this.size * 2) + this.size);
                this.position.y = Math.floor(Math.random() * (HEIGHT - this.size * 2) + this.size); 
            }while(this.collision_with_snake()); 
        }

        /**
         * check a collision betwenn snake and the fruiy
         * @return true if not collision, false otherwise 
         */
        collision_with_snake() {     
            let x1,y1,w,h;
            for (let i = 0; i < snake.segments.length-1; i++) {
                if(snake.segments[i].y === snake.segments[i+1].y) { // segment horizontal 
                    if(snake.segments[i+1].x - snake.segments[i].x > 0) { // left
                        x1 = snake.segments[i].x;
                        y1 = snake.segments[i].y - snake.size/2;
                        h = snake.size;
                        w = snake.segments[i+1].x - snake.segments[i].x;
                    }else { //right
                        x1 = snake.segments[i+1].x;
                        y1 = snake.segments[i+1].y - snake.size/2;
                        h = snake.size;
                        w = snake.segments[i].x - snake.segments[i+1].x;
                    }
                }

                if(snake.segments[i].x === snake.segments[i+1].x) { // segment vertical 
                    if(snake.segments[i+1].y - snake.segments[i].y > 0) { // haut
                        x1 = snake.segments[i].x - snake.size/2;
                        y1 = snake.segments[i].y;
                        w = snake.size;
                        h = snake.segments[i+1].y - snake.segments[i].y;
                    }else { // bas
                        x1 = snake.segments[i+1].x - snake.size/2;
                        y1 = snake.segments[i+1].y;
                        w = snake.size;
                        h = snake.segments[i].y - snake.segments[i+1].y;
                    }
                }

                let ret = pointInRect(x1, y1, w, h, this.position.x, this.position.y);
                if (ret) {
                    return true;
                }
            }
            return false;
        }
    }

    // deux prochaine fonction viennent de https://gist.github.com/gordonwoodhull/50eb65d2f048789f9558
    function between(a, b, c) {
        let eps = 0.0000001;
        return a-eps <= b && b <= c+eps;
    }

    /**
     * Regarde s'il y a collison entre deux sements
     * @param {} x1 
     * @param {*} y1 
     * @param {*} x2 
     * @param {*} y2 
     * @param {*} x3 
     * @param {*} y3 
     * @param {*} x4 
     * @param {*} y4 
     * @returns true if intersection false otherwise
     */
    function segments_intersection(x1,y1,x2,y2, x3,y3,x4,y4) {

        var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4)) /
                ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
        var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4)) /
                ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
        if (isNaN(x) || isNaN(y)) {
            return false;
        } else {
            if (x1>=x2) {
                if (!between(x2, x, x1)) {return false;}
            } else {
                if (!between(x1, x, x2)) {return false;}
            }
            if (y1>=y2) {
                if (!between(y2, y, y1)) {return false;}
            } else {
                if (!between(y1, y, y2)) {return false;}
            }
            if (x3>=x4) {
                if (!between(x4, x, x3)) {return false;}
            } else {
                if (!between(x3, x, x4)) {return false;}
            }
            if (y3>=y4) {
                if (!between(y4, y, y3)) {return false;}
            } else {
                if (!between(y3, y, y4)) {return false;}
            }
        }
        return true;
    }
    
    function pointInRect(x1, y1, w, h,x, y) {
        let eps = snake.size;
        if(x >= x1 - eps && x <= x1 + w + eps && y >= y1 && y - eps <= y1 + h + eps) {
            return true;
        }
        return false;
    }

    function distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }

    let score = 0;
    let snake = new Snake(30, 0.2, WIDTH/2, HEIGHT/2, 1, 0, 200);
    let fruit = new Fruit(10, 200);

    document.addEventListener("keydown", function(e) {
        if(snake.alive) {
            snake.segments.unshift({x: snake.segments[0].x, y:snake.segments[0].y});
            switch (e.key) {
                case "d":                
                case "ArrowRight": 
                    if(snake.direction.x != -1) {
                        snake.direction.x = 1; 
                        snake.direction.y = 0;
                    }
                    break;
                case "q":                
                case "ArrowLeft":                
                    if(snake.direction.x != 1) {
                        snake.direction.x = -1;
                        snake.direction.y = 0;
                    }
                    break;
                case "z":
                case "ArrowUp":
                    if(snake.direction.y != 1) {  
                        snake.direction.x = 0;
                        snake.direction.y = -1;
                    }
                    break;
                case "s":
                case "ArrowDown":
                    if(snake.direction.y != -1) {
                        snake.direction.x = 0;
                        snake.direction.y = 1;
                    }
                    break;
            }            
        } 
    });

    /** Dernière mise à jour de l'affichage */
    let last = Date.now();

    /** Dernière mise à jour */
    function update(now) {
        // delta de temps entre deux mises à jour 
        let dt = now - last;
        last = now;

        if(snake.alive) {
            snake.move(dt); 
            
            let intersection = false;
            // look a collsion between first segment and other segments
            for (let i = 2; i < snake.segments.length-1; ++i) {
                if(segments_intersection(snake.segments[0].x, snake.segments[0].y, snake.segments[1].x, snake.segments[1].y,
                                    snake.segments[i].x, snake.segments[i].y, snake.segments[i+1].x, snake.segments[i+1].y)) {
                    intersection = true;
                    break;
                }
            }

            if (intersection || snake.segments[0].x < 10 || snake.segments[0].x > WIDTH - 10 || snake.segments[0].y < 10 || 
                                                                            snake.segments[0].y > HEIGHT - 10) {
                snake.alive = false;
                
                // retrieve player scores with their name in a table
                let joueurs = JSON.parse(localStorage.getItem("snake"));
                
                if (joueurs!=null) { // score table is no empty
                    if(joueurs.length < 10 || score > joueurs[joueurs.length-1].score) {
                        let pseudoJ = prompt("Nouveau score dans le top 10. Quelle est votre pseudo ?");
                        if(pseudoJ !== null) {     
                            // insert the player
                            joueurs.push({pseudo: pseudoJ, score: score});
                            
                            // sort the table 
                            joueurs.sort(function(a, b) { 
                                return b.score - a.score;
                            });

                            if(joueurs.length > 10) {
                                // remove the player with the lowest score
                                joueurs.pop();
                            }
                            // save player scores as a string
                            localStorage.setItem("snake", JSON.stringify(joueurs));
                        }
                    }   
                }else { // scor table is empty
                    let pseudoJ = prompt("Nouveau score dans le top 10. Quelle est votre pseudo ?");
                    if(pseudoJ !== null) {
                        // build the table 
                        localStorage.setItem("snake", `[{"pseudo": "${pseudoJ}", "score": ${score}}]`);
                    }
                }
            }

            // check the collision with the fruit
            
            if(distance(fruit.position.x, fruit.position.y, snake.segments[0].x + (snake.size/1.7) * snake.direction.x, 
                                snake.segments[0].y + (snake.size/1.7) * snake.direction.y,2) < fruit.size+snake.size/2) {
                // increase the maximum allowed size of the snake
                snake.lengthMax += fruit.gain;
                score += fruit.gain/2;
                fruit.place();
            }
        }
    }

    /** Réaffichage du contenu du canvas */
    function render() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
        // scores display
        ctx.font = "15pt Calibri,Geneva,Arial";
        ctx.fillStyle = "white";
        let lengthScore = ctx.measureText(`Score : ${score}`).width;
        ctx.fillText(`Score : ${score}`, WIDTH - lengthScore, 30);

        snake.draw();
        fruit.draw();

        if(!snake.alive) {
            // top scores display
            ctx.font = "25pt Calibri,Geneva,Arial";
            ctx.fillStyle = "purple";
            
            let lengthGameOver = ctx.measureText("GAME OVER").width;
            ctx.fillText("GAME OVER", WIDTH/2 - lengthGameOver/2, 100);

            // retrieve player scores with their name in a table
            let joueurs = JSON.parse(localStorage.getItem("snake"));
            if(joueurs != null) {
                for (let j = 0; j < joueurs.length; j++) {
                    let points = "";
                    while (ctx.measureText(joueurs[j].pseudo + points).width < 600 - ctx.measureText(joueurs[j].score + "  ").width) {
                        points += " . ";
                    }
                    
                    ctx.fillText(joueurs[j].pseudo + points, WIDTH/2 - 300, 150 + ((j + 1) * 30));
                    ctx.fillText(joueurs[j].score, WIDTH/2 + 300 - ctx.measureText(joueurs[j].score).width, 150 + ((j + 1) * 30));
                }
            }   
        }
    }

    /** Boucle de jeu */
    (function loop() {
        // précalcul de la prochaine image
        requestAnimationFrame(loop);
        // mise à jour du modèle de données
        update(Date.now());
        // affichage de la nouvelle image 
        render();
    })();
});