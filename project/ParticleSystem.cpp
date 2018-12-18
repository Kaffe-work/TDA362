#include "ParticleSystem.h"

/**
 * TODO: Implement the memory allocator, and implement the VAO and VBO for the particles
 */

void initParticles(int num, ParticleSystem * ps);

void ParticleSystem::kill(int id)	
{}
void ParticleSystem::spawn(Particle particle)
{}
void ParticleSystem::process_particles(float dt)
{}

void initParticles(int num, ParticleSystem * ps)
{
	ps -> particles.reserve(num);
}

