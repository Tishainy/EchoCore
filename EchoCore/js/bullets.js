console.log("Bullets module loaded"); // Módulo de balas cargado -- Bullets module loaded

export class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 10;
        this.speed = 5;
    }

    update() {
        this.y -= this.speed; // Actualiza la posición de la bala -- Updates the bullet's position
    }

    draw(ctx) {
        ctx.fillStyle = "red"; // Establece el color de la bala a rojo -- Sets the bullet color to red
        ctx.fillRect(this.x, this.y, this.width, this.height); // Dibuja la bala en el canvas -- Draws the bullet on the canvas
    }
}

export class EnemyBullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 10;
        this.speed = 3;
        this.angle = angle; // Ángulo de disparo -- Shooting angle
    }

    update() {
        this.x += this.speed * Math.cos(this.angle); // Actualiza la posición en el eje X -- Updates the position on the X-axis
        this.y += this.speed * Math.sin(this.angle); // Actualiza la posición en el eje Y -- Updates the position on the Y-axis
    }

    draw(ctx) {
        ctx.fillStyle = "blue"; // Establece el color de la bala enemiga a azul -- Sets the enemy bullet color to blue
        ctx.fillRect(this.x, this.y, this.width, this.height); // Dibuja la bala enemiga en el canvas -- Draws the enemy bullet on the canvas
    }
}

export class BossBullet extends EnemyBullet {
    constructor(x, y, angle) {
        super(x, y, angle); // Hereda de EnemyBullet -- Inherits from EnemyBullet
        this.bounces = 0;
        this.maxBounces = 1; // Rebota una vez -- Bounces once
        this.creationTime = Date.now(); // Hora de creación de la bala -- Bullet creation time
        this.lifetime = 7000; // 7 segundos -- 7 seconds
    }

    update() {
        // Calcula la velocidad -- Calculates the velocity
        const vx = this.speed * Math.cos(this.angle); 
        const vy = this.speed * Math.sin(this.angle);

        // Actualiza la posición -- Updates the position
        this.x += vx;
        this.y += vy;

        // Rebota en los bordes del canvas si aún hay rebotes restantes -- Bounces off the canvas edges if bounces remain
        if (this.bounces < this.maxBounces) {
            if (this.x <= 0 || this.x + this.width >= 500) { // Ancho del canvas = 500 -- Canvas width = 500
                this.angle = Math.PI - this.angle; // Refleja horizontalmente -- Reflects horizontally
                this.bounces++;
            }
            if (this.y <= 0 || this.y + this.height >= 500) { // Alto del canvas = 500 -- Canvas height = 500
                this.angle = -this.angle; // Refleja verticalmente -- Reflects vertically
                this.bounces++;
            }
        }

        // Normaliza el ángulo -- Normalizes the angle
        if (this.angle < 0) this.angle += 2 * Math.PI;
        if (this.angle >= 2 * Math.PI) this.angle -= 2 * Math.PI;
    }

    draw(ctx) {
        ctx.fillStyle = "purple"; // Establece el color de la bala del jefe a morado -- Sets the boss bullet color to purple
        ctx.fillRect(this.x, this.y, this.width, this.height); // Dibuja la bala del jefe en el canvas -- Draws the boss bullet on the canvas
    }

    hasExpired() {
        return Date.now() - this.creationTime > this.lifetime; // Retorna verdadero después de 7 segundos -- Returns true after 7 seconds
    }
}