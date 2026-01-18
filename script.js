  const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreEl = document.getElementById('score');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let score = 0;
        let gameActive = true;

        class Player {
            constructor() {
                this.x = canvas.width / 2;
                this.y = canvas.height / 2;
                this.radius = 15;
                this.angle = 0;
                this.rotation = 0;
                this.thrusting = false;
                this.velocity = { x: 0, y: 0 };
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                
                // Ship Glow
                ctx.shadowBlur = 15;
                ctx.shadowColor = "#00f2ff";
                ctx.strokeStyle = "#00f2ff";
                ctx.lineWidth = 3;
                
                ctx.beginPath();
                ctx.moveTo(20, 0);
                ctx.lineTo(-15, 12);
                ctx.lineTo(-10, 0); // Tail notch
                ctx.lineTo(-15, -12);
                ctx.closePath();
                ctx.stroke();
                
                // Thrust fire
                if (this.thrusting) {
                    ctx.strokeStyle = "#ff007f";
                    ctx.shadowColor = "#ff007f";
                    ctx.beginPath();
                    ctx.moveTo(-12, 0);
                    ctx.lineTo(-25, Math.random() * 5 - 2.5);
                    ctx.stroke();
                }
                ctx.restore();
            }

            update() {
                this.angle += this.rotation;
                if (this.thrusting) {
                    this.velocity.x += Math.cos(this.angle) * 0.12;
                    this.velocity.y += Math.sin(this.angle) * 0.12;
                }
                this.velocity.x *= 0.99; // Friction
                this.velocity.y *= 0.99;
                this.x += this.velocity.x;
                this.y += this.velocity.y;
                
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            }
        }

        class Laser {
            constructor(x, y, angle) {
                this.x = x;
                this.y = y;
                this.velocity = { x: Math.cos(angle) * 10, y: Math.sin(angle) * 10 };
                this.life = 60;
            }
            draw() {
                ctx.fillStyle = "#fff";
                ctx.shadowBlur = 10;
                ctx.shadowColor = "#00f2ff";
                ctx.fillRect(this.x, this.y, 4, 4);
            }
            update() {
                this.x += this.velocity.x;
                this.y += this.velocity.y;
                this.life--;
            }
        }

        class Asteroid {
            constructor() {
                this.radius = Math.random() * 35 + 10;
                this.x = Math.random() < 0.5 ? -50 : canvas.width + 50;
                this.y = Math.random() * canvas.height;
                this.velocity = {
                    x: (Math.random() - 0.5) * 4,
                    y: (Math.random() - 0.5) * 4
                };
                this.hue = Math.random() * 360;
            }
            draw() {
                ctx.shadowBlur = 10;
                ctx.shadowColor = "rgba(255,255,255,0.3)";
                ctx.strokeStyle = `hsl(${this.hue}, 50%, 70%)`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.stroke();
            }
            update() {
                this.x += this.velocity.x;
                this.y += this.velocity.y;
                if (this.x < -100) this.x = canvas.width + 100;
                if (this.x > canvas.width + 100) this.x = -100;
                if (this.y < -100) this.y = canvas.height + 100;
                if (this.y > canvas.height + 100) this.y = -100;
            }
        }

        const player = new Player();
        const lasers = [];
        const asteroids = [];

        function spawnAsteroid() {
            if (asteroids.length < 10) asteroids.push(new Asteroid());
        }
        setInterval(spawnAsteroid, 1500);

        window.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowLeft') player.rotation = -0.07;
            if (e.code === 'ArrowRight') player.rotation = 0.07;
            if (e.code === 'ArrowUp') player.thrusting = true;
            if (e.code === 'Space') lasers.push(new Laser(player.x, player.y, player.angle));
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') player.rotation = 0;
            if (e.code === 'ArrowUp') player.thrusting = false;
        });

        function animate() {
            if (!gameActive) return;
            requestAnimationFrame(animate);
            
            // Clean trail effect
            ctx.fillStyle = 'rgba(2, 11, 22, 0.4)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            player.update();
            player.draw();

            lasers.forEach((laser, lIdx) => {
                laser.update();
                laser.draw();
                if (laser.life <= 0) lasers.splice(lIdx, 1);
            });

            asteroids.forEach((asteroid, aIdx) => {
                asteroid.update();
                asteroid.draw();

                const dist = Math.hypot(player.x - asteroid.x, player.y - asteroid.y);
                if (dist < player.radius + asteroid.radius) {
                    gameActive = false;
                    document.getElementById('gameOver').style.display = 'block';
                }

                lasers.forEach((laser, lIdx) => {
                    const lDist = Math.hypot(laser.x - asteroid.x, laser.y - asteroid.y);
                    if (lDist < asteroid.radius) {
                        asteroids.splice(aIdx, 1);
                        lasers.splice(lIdx, 1);
                        score += 100;
                        scoreEl.innerHTML = score;
                    }
                });
            });
        }
        animate();

        // Handle Resize
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });     
