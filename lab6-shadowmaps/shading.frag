#version 420

// required by GLSL spec Sect 4.5.3 (though nvidia does not, amd does)
precision highp float;

///////////////////////////////////////////////////////////////////////////////
// Material
///////////////////////////////////////////////////////////////////////////////
uniform vec3 material_color;
uniform float material_reflectivity;
uniform float material_metalness;
uniform float material_fresnel;
uniform float material_shininess;
uniform float material_emission;

uniform int has_emission_texture;
layout(binding = 5) uniform sampler2D emissiveMap;

///////////////////////////////////////////////////////////////////////////////
// Environment
///////////////////////////////////////////////////////////////////////////////
layout(binding = 6) uniform sampler2D environmentMap;
layout(binding = 7) uniform sampler2D irradianceMap;
layout(binding = 8) uniform sampler2D reflectionMap;
uniform float environment_multiplier;

///////////////////////////////////////////////////////////////////////////////
// Light source
///////////////////////////////////////////////////////////////////////////////
uniform vec3 point_light_color = vec3(1.0, 1.0, 1.0);
uniform float point_light_intensity_multiplier = 50.0;

uniform vec3 viewSpaceLightDir;
uniform float spotOuterAngle;
uniform float spotInnerAngle;

///////////////////////////////////////////////////////////////////////////////
// Constants
///////////////////////////////////////////////////////////////////////////////
#define PI 3.14159265359

///////////////////////////////////////////////////////////////////////////////
// Input varyings from vertex shader
///////////////////////////////////////////////////////////////////////////////
in vec2 texCoord;
in vec3 viewSpaceNormal;
in vec3 viewSpacePosition;

///////////////////////////////////////////////////////////////////////////////
// Input uniform variables
///////////////////////////////////////////////////////////////////////////////
uniform mat4 viewInverse;
uniform vec3 viewSpaceLightPosition;

///////////////////////////////////////////////////////////////////////////////
// Output color
///////////////////////////////////////////////////////////////////////////////
layout(location = 0) out vec4 fragmentColor;

//part 2

in vec4 shadowMapCoord;
//layout(binding = 10) uniform sampler2D shadowMapTex;



//uses 


//float textureProj( 	sampler1DShadow sampler,
  //	vec4 P,
  //	[float bias]);


layout(binding = 10) uniform sampler2DShadow shadowMapTex;

///////////////////////////////////////////////////////////////////////////////
// Output color
///////////////////////////////////////////////////////////////////////////////

float fresnel_term(vec3 wh, vec3 wi);
float microfacet_distrib_fun(vec3 wh,vec3 n);

vec3 diffuse_term;
vec3 dielectric_term;
vec3 metal_term;
vec3 microfacet_term;
vec4 irradiance;
vec2 lookup;
vec3 wi;
vec3 wh;

vec3 calculateDirectIllumiunation ( vec3 wo, vec3 n ) {
{
	///////////////////////////////////////////////////////////////////////////
	// Task 1.2 - Calculate the radiance Li from the light, and the direction
	//            to the light. If the light is backfacing the triangle, 
	//            return vec3(0); 
	///////////////////////////////////////////////////////////////////////////
	//vector from vertex to light with: viewSpaceLightPosition, viewSpacePosition;
	vec3 lw = viewSpaceLightPosition -viewSpacePosition;
	//calculate distance from vertex to light with: viewSpaceLightPosition, viewSpacePosition;
	float d = length ( lw );
	//calculate light reflected
	vec3 Li = point_light_intensity_multiplier * point_light_color/( d*d );
	//direction from the fragment to the light
	vec3 wi = normalize ( lw );

	if( dot ( n, wi )<=0 ) {
		return vec3 ( 0.0 );
	};

	
	///////////////////////////////////////////////////////////////////////////
	// Task 1.3 - Calculate the diffuse term and return that as the result
	///////////////////////////////////////////////////////////////////////////
	 diffuse_term = material_color * ( 1.0/PI ) * dot ( n, wi ) * Li;
	///////////////////////////////////////////////////////////////////////////
	// Task 1.3 - Calculate the diffuse term and return that as the result
	///////////////////////////////////////////////////////////////////////////
	// vec3 diffuse_term = ...

	///////////////////////////////////////////////////////////////////////////
	// Task 2 - Calculate the Torrance Sparrow BRDF and return the light 
	//          reflected from that instead
	///////////////////////////////////////////////////////////////////////////
	vec3 wh = normalize ( wi+wo );

	float whi = dot ( wh, wi );
	float woh = dot ( wo, wh );
	float nwh = dot ( n, wh );
	float nwo = dot ( n, wo );
	float nwi = dot ( n, wi );


	//frensel term
	float Fwi = fresnel_term(wh, wi);

	//metal shininess
	float Dwh = microfacet_distrib_fun(wh, n);

	float Gwiwo = min ( 1, min ( 2*nwh*nwo/dot(wo,wh), 2*nwh*nwi/woh ) );

	float brdf = Fwi * Dwh * Gwiwo/( 4*nwo*nwi );


	///////////////////////////////////////////////////////////////////////////
	// Task 3 - Make your shader respect the parameters of our material model.
	///////////////////////////////////////////////////////////////////////////
	//return vec3(material_color);  
	// this line above kept me from understanding what was wrong for over a week. sometimes, i do the dumb. 
	// instead of actually returning the value calculated i returned default values, and then did the calculations,
	// hence, everything left in this method did nothing....


	dielectric_term = brdf * nwi * Li+( 1-Fwi ) * diffuse_term;

	metal_term = brdf * material_color * nwi * Li;

	microfacet_term = material_metalness  * metal_term+ ( 1-material_metalness ) * dielectric_term;

	return material_reflectivity * microfacet_term+( 1-material_reflectivity ) * diffuse_term;
}


}


float fresnel_term(vec3 wh, vec3 wi){
	return material_fresnel + (1 - material_fresnel)* pow((1 - dot(wh,wi)),5);
}

float microfacet_distrib_fun(vec3 wh,vec3 n){
	return ((material_shininess + 2)/(2*PI)) * pow(dot(n,wh),material_shininess);
}




vec3 calculateIndirectIllumination(vec3 wo, vec3 n)
{
	///////////////////////////////////////////////////////////////////////////
	// Task 5 - Lookup the irradiance from the irradiance map and calculate
	//          the diffuse reflection
	///////////////////////////////////////////////////////////////////////////
	vec3 nws = vec3(viewInverse * vec4(n, 0.0f));

	// Calculate the spherical coordinates of the direction
	float theta = acos ( max ( -1.0f, min ( 1.0f, nws.y ) ) );
	float phi = atan ( nws.z, nws.x );
	if( phi < 0.0f ) phi = phi+2.0f * PI;
	// Use these to lookup the color in the environment map
	lookup = vec2 ( phi/( 2.0 * PI ), theta/PI );

	irradiance = environment_multiplier * texture ( irradianceMap, lookup );
	diffuse_term = material_color * ( 1.0/PI ) * irradiance.xyz;
	//return diffuse_term;


	///////////////////////////////////////////////////////////////////////////
	// Task 6 - Look up in the reflection map from the perfect specular 
	//          direction and calculate the dielectric and metal terms. 
	///////////////////////////////////////////////////////////////////////////
	vec3 wi = (viewInverse * vec4(reflect(-1.0f*wo, n), 0.0f)).xyz;
	wi = reflect ( -wo, n );
	wh = normalize ( wi+ (-wo) );


	float wih = dot ( wi, wh );
	
	// Calculate the spherical coordinates 
	theta = acos ( max ( -1.0f, min ( 1.0f, wi.y ) ) );
	phi = atan ( wi.z, wi.x );
	if( phi < 0.0f ) phi = phi+2.0f * PI;
	// Use these to lookup the color in the environment map
	vec2 lookup = vec2 ( phi/( 2.0 * PI ), theta/PI );


	//magic formula 
	//added a material shininess multiplier, hence it multiplies in the range of 0-25000/1000
	//why this works is truly beyond me, as it is not what one is supposed to do here. 
	float roughness = sqrt ( sqrt ( 2/( material_shininess*(material_shininess/1000)) ) );
	float Fwi = fresnel_term(wh, wh);

	vec3 Li = environment_multiplier * textureLod ( reflectionMap, lookup, roughness * 7.0 ).xyz;

	dielectric_term = Fwi*Li+( 1-Fwi )* diffuse_term;
	metal_term = Fwi * material_color * Li;
	microfacet_term = material_metalness  * metal_term+( 1-material_metalness ) * dielectric_term;

	return material_reflectivity * microfacet_term+( 1-material_reflectivity ) * diffuse_term;

	//return vec3(0.0);
}


void main() 
{



	
	//task 2 
	//float depth= texture( shadowMapTex, shadowMapCoord.xy/shadowMapCoord.w ).r;
	//float visibility= (depth>=(shadowMapCoord.z/shadowMapCoord.w)) ? 1.0 : 0.0;
	float visibility = textureProj( shadowMapTex, shadowMapCoord );
	float attenuation = 1.0;
	

	vec3 wo = -normalize(viewSpacePosition);
	vec3 n = normalize(viewSpaceNormal);

	vec3 posToLight = normalize(viewSpaceLightPosition - viewSpacePosition);
	float cosAngle = dot(posToLight, -viewSpaceLightDir);

	// Spotlight with hard border:
	//float spotAttenuation = (cosAngle > spotOuterAngle) ? 1.0 : 0.0;
	float spotAttenuation = smoothstep(spotOuterAngle, spotInnerAngle, cosAngle);
	visibility *= spotAttenuation;


	// Direct illumination
	vec3 direct_illumination_term = visibility * calculateDirectIllumiunation(wo, n);

	// Indirect illumination
	vec3 indirect_illumination_term = calculateIndirectIllumination(wo, n);

	


	///////////////////////////////////////////////////////////////////////////
	// Add emissive term. If emissive texture exists, sample this term.
	///////////////////////////////////////////////////////////////////////////
	vec3 emission_term = material_emission * material_color;
	if (has_emission_texture == 1) {
		emission_term = texture(emissiveMap, texCoord).xyz;
	}

	vec3 shading = 
		direct_illumination_term +
		indirect_illumination_term +
		emission_term;

	fragmentColor = vec4(shading, 1.0);
	return;

}
