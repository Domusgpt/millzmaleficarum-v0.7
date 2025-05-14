/* core/ShaderManager.js - v1.6 */
/* Enhanced shader performance and new visualization effects */

class ShaderManager {
    constructor(gl, geometryManager, projectionManager, options = {}) { 
        if (!gl) throw new Error("WebGL context needed."); 
        this.gl = gl; 
        this.geometryManager = geometryManager; 
        this.projectionManager = projectionManager; 
        this.options = this._mergeDefaults(options); 
        this.shaderSources = {}; 
        this.compiledShaders = {}; 
        this.programs = {}; 
        this.uniformLocations = {}; 
        this.attributeLocations = {}; 
        this.currentProgramName = null; 
        this._initShaderTemplates(); 
        
        // v1.5 - Support for UniversalHyperAV
        if (!this.geometryManager) {
            // Create a minimal implementation for standalone use with UniversalHyperAV
            this.geometryManager = {
                getGeometry: (name) => ({
                    getShaderCode: () => this.shaderSources[`${name}-geometry`]?.source || ''
                })
            };
        }
        
        if (!this.projectionManager) {
            // Create a minimal implementation for standalone use with UniversalHyperAV
            this.projectionManager = {
                getProjection: (name) => ({
                    getShaderCode: () => this.shaderSources[`${name}-projection`]?.source || ''
                })
            };
        }
    }
    _mergeDefaults(options){ return { baseVertexShaderName: 'base-vertex', baseFragmentShaderName: 'base-fragment', ...options }; }
    _initShaderTemplates(){ 
        // Register base shaders
        this._registerShaderSource(this.options.baseVertexShaderName, this._getBaseVertexShaderSource(), this.gl.VERTEX_SHADER); 
        this._registerShaderSource(this.options.baseFragmentShaderName, this._getBaseFragmentShaderSource(), this.gl.FRAGMENT_SHADER);
        
        // v1.5 - Register UniversalHyperAV shaders
        this._registerShaderSource('hypercube-geometry', this._getHypercubeGeometryShader(), this.gl.FRAGMENT_SHADER);
        this._registerShaderSource('universal_environment-projection', this._getUniversalEnvironmentShader(), this.gl.FRAGMENT_SHADER);
    }
    _registerShaderSource(name, source, type){ this.shaderSources[name] = { source, type }; }
    _compileShader(shaderIdentifier, source, type) { if (this.compiledShaders[shaderIdentifier]) { return this.compiledShaders[shaderIdentifier]; } const shader = this.gl.createShader(type); if (!shader) { console.error(`Failed create shader '${shaderIdentifier}'.`); this.compiledShaders[shaderIdentifier] = null; return null; } this.gl.shaderSource(shader, source); this.gl.compileShader(shader); if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) { const log = this.gl.getShaderInfoLog(shader); console.error(`Compile error shader '${shaderIdentifier}':\n${log}`); this._logShaderSourceWithError(source, log); this.gl.deleteShader(shader); this.compiledShaders[shaderIdentifier] = null; return null; } this.compiledShaders[shaderIdentifier] = shader; return shader; }
    _logShaderSourceWithError(source, errorLog) { const lines=source.split('\n'); const match=errorLog.match(/ERROR:\s*\d+:(\d+):/); let errLine=match?parseInt(match[1],10):-1; console.error("--- Shader Source ---"); lines.forEach((line, i)=>{const p=(i+1===errLine)?">> ": "   "; console.error(p+(i+1).toString().padStart(3)+": "+line);}); console.error("--- Shader Source End ---"); }
    _createProgram(programName, vertexShader, fragmentShader) { if (this.programs[programName]) { const old = this.programs[programName]; if (old) { try { const shaders = this.gl.getAttachedShaders(old); shaders?.forEach(s => this.gl.detachShader(old, s)); this.gl.deleteProgram(old); } catch (e) {} } delete this.programs[programName]; delete this.uniformLocations[programName]; delete this.attributeLocations[programName]; } const program = this.gl.createProgram(); if (!program) { console.error(`Failed create program '${programName}'.`); return null; } this.gl.attachShader(program, vertexShader); this.gl.attachShader(program, fragmentShader); this.gl.linkProgram(program); if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) { console.error(`Link error program '${programName}':\n${this.gl.getProgramInfoLog(program)}`); try { this.gl.detachShader(program, vertexShader); } catch(e) {} try { this.gl.detachShader(program, fragmentShader); } catch(e) {} this.gl.deleteProgram(program); this.programs[programName] = null; return null; } this.programs[programName] = program; this.uniformLocations[programName] = {}; this.attributeLocations[programName] = {}; console.log(`Program '${programName}' created/linked.`); return program; }
    createDynamicProgram(programName, geometryTypeName, projectionMethodName) { const vsName = this.options.baseVertexShaderName; const vsInfo = this.shaderSources[vsName]; if (!vsInfo) { console.error(`Base VS source '${vsName}' missing.`); return null; } const vs = this._compileShader(vsName, vsInfo.source, vsInfo.type); if (!vs) return null; const geom = this.geometryManager.getGeometry(geometryTypeName); const proj = this.projectionManager.getProjection(projectionMethodName); if (!geom || !proj) { console.error(`Geom/Proj provider missing.`); return null; } const geomGLSL = geom.getShaderCode(); const projGLSL = proj.getShaderCode(); if (typeof geomGLSL !== 'string' || typeof projGLSL !== 'string') { console.error(`Invalid GLSL returned.`); return null; } const fsName = this.options.baseFragmentShaderName; const fsInfo = this.shaderSources[fsName]; if (!fsInfo) { console.error(`Base FS source '${fsName}' missing.`); return null; } let fsSource = fsInfo.source; fsSource = fsSource.replace('//__GEOMETRY_CODE_INJECTION_POINT__', geomGLSL); fsSource = fsSource.replace('//__PROJECTION_CODE_INJECTION_POINT__', projGLSL); const fsId = `fragment-${geometryTypeName}-${projectionMethodName}`; const fs = this._compileShader(fsId, fsSource, fsInfo.type); if (!fs) return null; const newProg = this._createProgram(programName, vs, fs); if (this.currentProgramName === programName) { if (newProg) { this.gl.useProgram(newProg); } else { this.gl.useProgram(null); this.currentProgramName = null; console.error(`Failed rebuild active program '${programName}'.`); } } return newProg; }
    useProgram(programName) { if (programName === null) { if (this.currentProgramName !== null) { try { this.gl.useProgram(null); } catch(e){} this.currentProgramName = null; } return true; } const program = this.programs[programName]; if (program) { const currentGLProgram = this.gl.getParameter(this.gl.CURRENT_PROGRAM); if (currentGLProgram !== program) { try { this.gl.useProgram(program); } catch(e) { console.error(`useProgram failed for ${programName}`, e); return false;} } this.currentProgramName = programName; return true; } else { console.warn(`Program '${programName}' not found or invalid.`); if (this.currentProgramName === programName) { this.currentProgramName = null; try { this.gl.useProgram(null); } catch(e){} } return false;} }
    getUniformLocation(name) { if (!this.currentProgramName || !this.programs[this.currentProgramName]) { return null; } const cache = this.uniformLocations[this.currentProgramName]; if (cache.hasOwnProperty(name)) { return cache[name]; } const loc = this.gl.getUniformLocation(this.programs[this.currentProgramName], name); cache[name] = loc; return loc; }
    getAttributeLocation(name) { if (!this.currentProgramName || !this.programs[this.currentProgramName]) { return null; } const cache = this.attributeLocations[this.currentProgramName]; if (cache.hasOwnProperty(name)) { return cache[name]; } const loc = this.gl.getAttribLocation(this.programs[this.currentProgramName], name); cache[name] = (loc === -1) ? null : loc; return cache[name]; }
    _getBaseVertexShaderSource() { return `attribute vec2 a_position; varying vec2 v_uv; void main() { v_uv = a_position * 0.5 + 0.5; gl_Position = vec4(a_position, 0.0, 1.0); }`; }
    _getBaseFragmentShaderSource() {
        return `
            precision highp float;
            uniform vec2 u_resolution; uniform float u_time;
            uniform float u_dimension; uniform float u_morphFactor; uniform float u_rotationSpeed;
            uniform float u_universeModifier; uniform float u_patternIntensity; uniform float u_gridDensity;
            uniform float u_lineThickness; uniform float u_shellWidth; uniform float u_tetraThickness; // Specific thickness uniforms
            uniform float u_audioBass; uniform float u_audioMid; uniform float u_audioHigh;
            uniform float u_glitchIntensity; uniform float u_colorShift;
            uniform vec3 u_primaryColor; uniform vec3 u_secondaryColor; uniform vec3 u_backgroundColor;
            // v1.5 - Additional uniforms for UniversalHyperAV
            uniform vec2 u_mousePosition;
            uniform float u_worldBlend;
            uniform float u_worldIntensity;
            varying vec2 v_uv;
            
            mat4 rotXW(float a){float c=cos(a),s=sin(a);return mat4(c,0,0,-s, 0,1,0,0, 0,0,1,0, s,0,0,c);} mat4 rotYW(float a){float c=cos(a),s=sin(a);return mat4(1,0,0,0, 0,c,0,-s, 0,0,1,0, 0,s,0,c);} mat4 rotZW(float a){float c=cos(a),s=sin(a);return mat4(1,0,0,0, 0,1,0,0, 0,0,c,-s, 0,0,s,c);} mat4 rotXY(float a){float c=cos(a),s=sin(a);return mat4(c,-s,0,0, s,c,0,0, 0,0,1,0, 0,0,0,1);} mat4 rotYZ(float a){float c=cos(a),s=sin(a);return mat4(1,0,0,0, 0,c,-s,0, 0,s,c,0, 0,0,0,1);} mat4 rotXZ(float a){float c=cos(a),s=sin(a);return mat4(c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1);}
            vec3 rgb2hsv(vec3 c){vec4 K=vec4(0.,-1./3.,2./3.,-1.);vec4 p=mix(vec4(c.bg,K.wz),vec4(c.gb,K.xy),step(c.b,c.g));vec4 q=mix(vec4(p.xyw,c.r),vec4(c.r,p.yzx),step(p.x,c.r));float d=q.x-min(q.w,q.y);float e=1e-10;return vec3(abs(q.z+(q.w-q.y)/(6.*d+e)),d/(q.x+e),q.x);} vec3 hsv2rgb(vec3 c){vec4 K=vec4(1.,2./3.,1./3.,3.);vec3 p=abs(fract(c.xxx+K.xyz)*6.-K.www);return c.z*mix(K.xxx,clamp(p-K.xxx,0.,1.),c.y);}
            //__PROJECTION_CODE_INJECTION_POINT__
            //__GEOMETRY_CODE_INJECTION_POINT__
            void main() {
                vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0); vec2 uv = (v_uv * 2.0 - 1.0) * aspect;
                vec3 rayOrigin = vec3(0.0, 0.0, -2.5); vec3 rayDirection = normalize(vec3(uv, 1.0));
                float camRotY = u_time * 0.05 * u_rotationSpeed + u_audioMid * 0.1; float camRotX = sin(u_time * 0.03 * u_rotationSpeed) * 0.15 + u_audioHigh * 0.1;
                mat4 camMat = rotXY(camRotX) * rotYZ(camRotY); rayDirection = (camMat * vec4(rayDirection, 0.0)).xyz;
                vec3 p = rayDirection * 1.5; float latticeValue = calculateLattice(p);
                vec3 color = mix(u_backgroundColor, u_primaryColor, latticeValue);
                color = mix(color, u_secondaryColor, smoothstep(0.2, 0.7, u_audioMid) * latticeValue * 0.6);
                if (abs(u_colorShift) > 0.01) { vec3 hsv = rgb2hsv(color); hsv.x = fract(hsv.x + u_colorShift * 0.5 + u_audioHigh * 0.1); color = hsv2rgb(hsv); }
                color *= (0.8 + u_patternIntensity * 0.7);
                if (u_glitchIntensity > 0.001) {
                     float glitch = u_glitchIntensity * (0.5 + 0.5 * sin(u_time * 8.0 + p.y * 10.0));
                     vec2 offsetR = vec2(cos(u_time*25.), sin(u_time*18.+p.x*5.)) * glitch * 0.2 * aspect; vec2 offsetB = vec2(sin(u_time*19.+p.y*6.), cos(u_time*28.)) * glitch * 0.15 * aspect;
                     vec3 pR = normalize(vec3(uv + offsetR/aspect, 1.0)); pR = (camMat*vec4(pR,0.0)).xyz * 1.5; vec3 pB = normalize(vec3(uv + offsetB/aspect, 1.0)); pB = (camMat*vec4(pB,0.0)).xyz * 1.5;
                     float latticeR = calculateLattice(pR); float latticeB = calculateLattice(pB);
                     vec3 colorR = mix(u_backgroundColor, u_primaryColor, latticeR); colorR = mix(colorR, u_secondaryColor, smoothstep(0.2, 0.7, u_audioMid) * latticeR * 0.6);
                     vec3 colorB = mix(u_backgroundColor, u_primaryColor, latticeB); colorB = mix(colorB, u_secondaryColor, smoothstep(0.2, 0.7, u_audioMid) * latticeB * 0.6);
                     if (abs(u_colorShift) > 0.01) { vec3 hsvR=rgb2hsv(colorR); hsvR.x=fract(hsvR.x+u_colorShift*0.5+u_audioHigh*0.1); colorR=hsv2rgb(hsvR); vec3 hsvB=rgb2hsv(colorB); hsvB.x=fract(hsvB.x+u_colorShift*0.5+u_audioHigh*0.1); colorB=hsv2rgb(hsvB); }
                     color = vec3(colorR.r, color.g, colorB.b); color *= (0.8 + u_patternIntensity * 0.7);
                }
                color = pow(clamp(color, 0.0, 1.5), vec3(0.9));
                gl_FragColor = vec4(color, 1.0);
            }
        `;
    }
    
    // v1.6 - Enhanced shader functions for UniversalHyperAV
    
    /**
     * Hypercube geometry shader for UniversalHyperAV
     * - Improved performance with optimized calculation patterns
     * - Enhanced wireframe and surface rendering for 4D hyperobjects
     * - Added tesseract and hypersphere primitives
     * - Implemented audio-reactive morphing between different 4D objects
     */
    _getHypercubeGeometryShader() {
        return `
        // Optimized Hypercube geometry code with multiple primitive types
        
        // Fast hash function for optimized noise
        float hash(float n) {
            return fract(sin(n) * 43758.5453123);
        }
        
        // Signed distance function for 4D hypercube (tesseract)
        float hypercubeDistance(vec4 p) {
            // Optimized box SDF
            vec4 q = abs(p) - vec4(1.0);
            return length(max(q, 0.0)) + min(max(q.x, max(q.y, max(q.z, q.w))), 0.0);
        }
        
        // Signed distance function for 4D hypersphere
        float hypersphereDistance(vec4 p) {
            return length(p) - 1.0;
        }
        
        // Signed distance function for 4D octahedral hyperprism
        float hyperOctahedronDistance(vec4 p) {
            return dot(abs(p), vec4(1.0)) - 1.0;
        }
        
        // Signed distance function for 4D cross polytope
        float hyperCrossDistance(vec4 p) {
            // A higher dimensional cross shape
            float k = 0.8; // Size parameter
            p = abs(p);
            return length(p) - k * min(min(p.x, p.y), min(p.z, p.w));
        }
        
        // Enhanced smooth minimum function for improved field blending
        float smin(float a, float b, float k) {
            float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
            return mix(b, a, h) - k * h * (1.0 - h);
        }
        
        // Optimized hypercube wireframe effect with more defined edges
        float hypercubeWireframe(vec4 p) {
            vec4 d = abs(p) - vec4(1.0);
            
            // Responsive wireframe thickness with audio-reactivity
            float thicknessFactor = 0.05 * u_lineThickness * (1.0 + u_audioBass * 0.5 + u_audioMid * 0.3);
            float thresholdFactor = 0.04 + u_audioHigh * 0.02;
            
            // Optimize edge calculation
            float edge = 0.0;
            
            // Calculate all plane intersections in a more efficient way
            // xy, xz, xw planes
            float edgeX = min(abs(abs(d.x) - 1.0), thresholdFactor);
            float edgeY = min(abs(abs(d.y) - 1.0), thresholdFactor);
            float edgeZ = min(abs(abs(d.z) - 1.0), thresholdFactor);
            float edgeW = min(abs(abs(d.w) - 1.0), thresholdFactor);
            
            // Calculate edge proximity with thickness awareness
            edge = smoothstep(thresholdFactor, 0.0, 
                min(edgeX + edgeY, min(edgeX + edgeZ, 
                min(edgeX + edgeW, min(edgeY + edgeZ, 
                min(edgeY + edgeW, edgeZ + edgeW)))))
                - thicknessFactor
            );
            
            // Add pulsing glow to edges based on audio
            edge *= 1.0 + u_audioBass * 0.3 + u_audioHigh * sin(u_time * 2.0) * 0.2;
            
            return edge;
        }
        
        // New function: 4D grid patterns for quantum lattice effect
        float hyperGrid(vec4 p, float scale) {
            vec4 grid = abs(fract(p * scale) - 0.5);
            float gridLines = smoothstep(0.05, 0.01, min(min(grid.x, grid.y), min(grid.z, grid.w)));
            return gridLines;
        }
        
        // New function: Multiscale Fractal Noise for richer detail
        float fractalNoise(vec4 p) {
            float noise = 0.0;
            float amplitude = 1.0;
            float frequency = 1.0;
            float total = 0.0;
            
            // Use 4D coordinates for true hyperdimensional noise
            for (int i = 0; i < 4; i++) {
                // Generate noise using dot products of 4D coordinates
                float v = fract(dot(floor(p * frequency), vec4(127.1, 311.7, 74.7, 53.3)));
                v = sin(v * 17.0) * 43758.5453123;
                
                noise += amplitude * abs(fract(v) - 0.5) * 2.0;
                total += amplitude;
                amplitude *= 0.5;
                frequency *= 2.0;
                
                // Add audio-reactive distortion
                p.xy += vec2(u_audioMid * 0.02, u_audioHigh * 0.03) * sin(u_time + p.zw * 2.0);
            }
            
            return noise / total;
        }
        
        // Calculate the hyperdimensional lattice with multiple visualization modes
        float calculateLattice(vec3 p) {
            // Create 4D position with audio-reactive w component
            vec4 p4 = vec4(p, sin(u_time * 0.2) * u_universeModifier + u_audioBass * 0.5);
            
            // Create 4D rotations with improved dynamics
            float t = u_time * u_rotationSpeed;
            
            // Use more varied rotation speeds for different dimensions
            // Add audio reactivity to rotation speed
            float bassRot = t * 0.5 + u_audioBass * 0.2;
            float midRot = t * 0.3 + u_audioMid * 0.15;
            float highRot = t * 0.2 + u_audioHigh * 0.1;
            
            // More complex rotation matrix with audio influence
            mat4 rot = rotXW(bassRot) * rotYW(midRot) * rotZW(highRot) * 
                     rotXY(t * 0.1 + u_audioMid * 0.05) * 
                     rotYZ(t * 0.05 + u_audioHigh * 0.03);
            
            // Apply rotation
            p4 = rot * p4;
            
            // Calculate various 4D shapes
            float tesseract = hypercubeDistance(p4);
            float hypersphere = hypersphereDistance(p4 * (0.8 + u_audioMid * 0.3));
            float hyperoctahedron = hyperOctahedronDistance(p4 * (1.0 + u_audioBass * 0.2));
            float hypercross = hyperCrossDistance(p4 * (1.2 + u_audioHigh * 0.3));
            
            // Wireframe effect
            float wireframe = hypercubeWireframe(p4);
            
            // Grid pattern that reveals the hyperspace structure
            float grid = hyperGrid(p4, 2.0 + u_gridDensity * 0.5);
            
            // Add fractal noise for more detailed surfaces
            float noise = fractalNoise(p4 * 0.5) * u_patternIntensity;
            
            // Define multi-mode blending based on morphFactor (0-1.5 range)
            // This allows for multiple visualization modes
            float shape;
            
            if (u_morphFactor < 0.25) {
                // Mode 1: Tesseract to wireframe transition
                float blend = u_morphFactor * 4.0;
                shape = mix(tesseract, wireframe, blend);
            } 
            else if (u_morphFactor < 0.5) {
                // Mode 2: Wireframe to hypersphere transition
                float blend = (u_morphFactor - 0.25) * 4.0;
                shape = mix(wireframe, hypersphere, blend);
            }
            else if (u_morphFactor < 0.75) {
                // Mode 3: Hypersphere to hyperoctahedron transition
                float blend = (u_morphFactor - 0.5) * 4.0;
                shape = mix(hypersphere, hyperoctahedron, blend);
            }
            else if (u_morphFactor < 1.0) {
                // Mode 4: Hyperoctahedron to hypercross transition
                float blend = (u_morphFactor - 0.75) * 4.0;
                shape = mix(hyperoctahedron, hypercross, blend);
            }
            else if (u_morphFactor < 1.25) {
                // Mode 5: Hypercross to grid transition
                float blend = (u_morphFactor - 1.0) * 4.0;
                shape = mix(hypercross, grid, blend);
            }
            else {
                // Mode 6: Grid to noise field transition
                float blend = (u_morphFactor - 1.25) * 4.0;
                shape = mix(grid, noise, blend);
            }
            
            // Add audio reactivity to shape morphing
            shape = mix(shape, wireframe, u_audioBass * 0.2);
            shape = mix(shape, grid, u_audioHigh * 0.15);
            
            // Apply final shaping and intensity
            float lattice = smoothstep(0.2, 0.0, shape) * u_patternIntensity;
            
            // Add extra glow on beat
            lattice += u_audioBass * 0.2 * sin(u_time * 4.0 + p.x * 5.0);
            
            return lattice;
        }
        `;
    }
    
    /**
     * Universal environment projection for UniversalHyperAV
     * - Optimized noise and FBM calculations for better performance
     * - Enhanced quantum field visualization
     * - Added multiple visualization modes and transitions
     * - Improved audio reactivity with spectrum-aware effects
     */
    _getUniversalEnvironmentShader() {
        return `
        // Optimized Universal Environment Projection
        
        // Fast hash function for better performance
        float hash21(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
        }
        
        // Improved noise function with better performance
        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            
            // Improved cubic interpolation
            vec2 u = f * f * (3.0 - 2.0 * f);
            
            // Four corners
            float a = hash21(i);
            float b = hash21(i + vec2(1.0, 0.0));
            float c = hash21(i + vec2(0.0, 1.0));
            float d = hash21(i + vec2(1.0, 1.0));
            
            return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
        }
        
        // Optimized Fractional Brownian Motion
        float fbm(vec2 p) {
            float sum = 0.0;
            float amp = 0.5;
            float freq = 1.0;
            float totalAmp = 0.0;
            
            // Reduced iterations with better quality tradeoff
            for(int i = 0; i < 5; i++) {
                // Apply audio-reactive frequency shift
                float freqMod = freq * (1.0 + u_audioMid * 0.1 * sin(u_time * 0.2 + float(i)));
                sum += amp * noise(p * freqMod);
                totalAmp += amp;
                amp *= 0.5;
                freq *= 2.1; // Slightly non-integer ratio for less repetition
            }
            
            return sum / totalAmp;
        }
        
        // Domain warping for more complex patterns
        vec2 warp(vec2 p) {
            return p + 0.2 * vec2(
                fbm(p + vec2(0.0, u_time * 0.1)),
                fbm(p + vec2(u_time * 0.15, 0.0))
            );
        }
        
        // Advanced domain warping for quantum field distortion
        vec2 advancedWarp(vec2 p) {
            // Apply basic warp
            vec2 q = warp(p);
            
            // Second level of warping with audio reactivity
            q += 0.15 * vec2(
                fbm(q + vec2(u_audioHigh * 0.2, u_time * -0.1)),
                fbm(q + vec2(u_time * 0.08, u_audioBass * 0.3))
            );
            
            return q;
        }
        
        // Enhanced quantum field effect with more detail and better audio reactivity
        float quantumField(vec2 uv, float time) {
            // Domain-warped coordinates for more complexity
            vec2 warpedUV = advancedWarp(uv * (0.8 + u_audioMid * 0.4));
            
            // Apply multiple scale grid patterns
            float scale1 = 8.0 * u_gridDensity;
            float scale2 = 12.0 * u_gridDensity + u_audioBass * 5.0;
            
            // Base grid pattern
            vec2 grid1 = fract(warpedUV * scale1) - 0.5;
            vec2 grid2 = fract(warpedUV * scale2) - 0.5;
            
            // Grid lines with varying intensity based on audio
            float thickness1 = 0.05 * (1.0 + u_audioBass * 0.5);
            float thickness2 = 0.03 * (1.0 + u_audioMid * 0.8);
            
            float gridLines1 = smoothstep(thickness1, 0.0, abs(grid1.x)) + 
                              smoothstep(thickness1, 0.0, abs(grid1.y));
            float gridLines2 = smoothstep(thickness2, 0.0, abs(grid2.x)) + 
                              smoothstep(thickness2, 0.0, abs(grid2.y));
            
            // Combine grid patterns
            float gridLines = gridLines1 * 0.6 + gridLines2 * 0.4;
            
            // Enhanced fbm noise with multiple octaves
            float noise1 = fbm(warpedUV * scale1 * 0.3 + time * 0.1);
            float noise2 = fbm(warpedUV * scale2 * 0.1 - time * 0.05);
            
            // Modulate noise with audio
            float noiseIntensity = u_patternIntensity * (0.5 + u_audioMid * 0.8);
            float combinedNoise = (noise1 * 0.7 + noise2 * 0.3) * noiseIntensity;
            
            // Quantum particles effect - small bright dots
            float particles = 0.0;
            for (int i = 0; i < 3; i++) {
                vec2 particleUV = fract(warpedUV * (15.0 + float(i) * 10.0) + time * (0.05 + float(i) * 0.03));
                float particle = smoothstep(0.9, 0.95, noise(particleUV * 10.0));
                particles += particle * (0.3 + u_audioHigh * 0.5);
            }
            
            // Add wave patterns with audio reactivity
            float wave1 = sin((warpedUV.x + warpedUV.y) * (5.0 + u_audioBass * 2.0) + time * 0.5) * 0.5 + 0.5;
            float wave2 = sin((warpedUV.x - warpedUV.y) * (3.0 + u_audioMid * 3.0) - time * 0.3) * 0.5 + 0.5;
            float waves = wave1 * wave2;
            
            // Combine all effects with audio-reactive mixing
            float baseMix = 0.3 + u_audioMid * 0.3;
            float quantumEffect = mix(
                gridLines * (0.4 + u_audioBass * 0.2), 
                combinedNoise * waves,
                baseMix
            ) + particles * 0.5;
            
            // Add pulse effect on strong bass
            quantumEffect *= 1.0 + u_audioBass * 0.5 * sin(time * 4.0);
            
            return quantumEffect * u_patternIntensity;
        }
        
        // New vortex field effect for swirling patterns
        float vortexField(vec2 uv, float time) {
            // Center coordinates
            vec2 center = vec2(0.5, 0.5);
            vec2 p = uv - center;
            
            // Calculate angle and distance
            float angle = atan(p.y, p.x);
            float dist = length(p);
            
            // Audio-reactive swirl
            float swirl = u_audioMid * 5.0 + u_audioBass * 3.0;
            float distortedAngle = angle + dist * (sin(time * 0.2) * 10.0 + swirl);
            
            // Spiral patterns
            float spiral = sin(distortedAngle * 8.0 + dist * 20.0 - time * 0.5);
            spiral = smoothstep(0.0, 0.2, abs(spiral)) * (1.0 - dist);
            
            // Add radial pulse
            float pulse = smoothstep(0.5, 0.4, abs(fract(dist * 10.0 - time * 0.1 + u_audioBass) - 0.5));
            
            return (spiral * 0.6 + pulse * 0.4) * smoothstep(1.0, 0.5, dist);
        }
        
        // New nebula field effect for gaseous, cloudy patterns
        float nebulaField(vec2 uv, float time) {
            // Apply warping for more organic shapes
            vec2 warpedUV = warp(uv * 1.5 + time * 0.05);
            
            // Create base noise layers
            float noise1 = fbm(warpedUV * 2.0);
            float noise2 = fbm(warpedUV * 4.0 - time * 0.02);
            float noise3 = fbm(warpedUV * 8.0 + time * 0.01);
            
            // Layer the noise with different frequencies
            float nebula = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
            
            // Add audio-reactive intensity variation
            nebula = pow(nebula, 1.0 + u_audioMid * 0.5);
            nebula *= 1.0 + u_audioBass * 0.3 * sin(time * 2.0 + uv.x * 10.0);
            
            // Add some bright spots - "stars"
            float stars = smoothstep(0.75, 0.8, fbm(uv * 20.0));
            stars *= u_audioHigh * 2.0;
            
            return nebula * 0.8 + stars;
        }
        
        // Circuit field effect for tech/cyber patterns
        float circuitField(vec2 uv, float time) {
            // Grid setup for circuit base
            float scale = 8.0 * u_gridDensity;
            vec2 gridUV = fract(uv * scale) - 0.5;
            
            // Main circuit traces
            float traces = smoothstep(0.05, 0.0, abs(gridUV.x)) + smoothstep(0.05, 0.0, abs(gridUV.y));
            
            // Add nodes at intersections
            vec2 nodeUV = floor(uv * scale);
            float nodeRandom = hash21(nodeUV);
            float nodeTime = time * 0.2 + nodeRandom * 6.28;
            float nodeActive = step(0.6, nodeRandom) * (0.5 + 0.5 * sin(nodeTime));
            
            float nodes = 0.0;
            if (length(gridUV) < 0.1 + nodeActive * 0.1 * u_audioBass) {
                nodes = 1.0 + u_audioHigh * nodeActive;
            }
            
            // Add data flow pulses along traces
            float flow = 0.0;
            if (abs(gridUV.x) < 0.05) {
                float flowPos = fract(uv.y * scale - time * (1.0 + nodeRandom * 2.0));
                flow += smoothstep(0.9, 0.0, abs(flowPos - 0.5)) * 0.5;
            }
            if (abs(gridUV.y) < 0.05) {
                float flowPos = fract(uv.x * scale - time * (0.7 + nodeRandom * 1.0));
                flow += smoothstep(0.9, 0.0, abs(flowPos - 0.5)) * 0.5;
            }
            
            flow *= 0.5 + u_audioMid * 0.5;
            
            // Combine all effects
            return traces * 0.4 + nodes * 0.6 + flow * u_audioHigh;
        }
        
        // Transform regular calculateLattice to support universal environment projection
        float calculateUniversalLattice(vec2 uv, float time) {
            // Calculate base hypercube effect with perspective
            vec2 p = (uv * 2.0 - 1.0) * (u_resolution / min(u_resolution.x, u_resolution.y));
            
            // Apply audio-reactive scaling
            p *= 1.0 + u_audioBass * 0.2 + u_audioMid * sin(time) * 0.1;
            
            // Enhanced mouse interaction with momentum
            vec2 mouseOffset = u_mousePosition * 2.0 - 1.0;
            p += mouseOffset * (0.1 + u_audioHigh * 0.05);
            
            // Set up a direction based on normalized UV
            vec3 direction = normalize(vec3(p, 1.0));
            
            // Apply improved camera rotation with audio reactivity
            float camRotY = time * 0.05 * u_rotationSpeed + 
                           u_audioMid * 0.1 * sin(time) + 
                           u_audioBass * 0.15 * cos(time * 0.5);
                           
            float camRotX = sin(time * 0.03 * u_rotationSpeed) * 0.15 + 
                           u_audioHigh * 0.1 * sin(time * 2.0) + 
                           u_audioBass * 0.05 * cos(time);
                           
            mat4 camMat = rotXY(camRotX) * rotYZ(camRotY);
            direction = (camMat * vec4(direction, 0.0)).xyz;
            
            // Calculate core visualization effects
            float lattice = calculateLattice(direction * 1.5);
            float quantum = quantumField(uv, time);
            float vortex = vortexField(uv, time);
            float nebula = nebulaField(uv, time);
            float circuit = circuitField(uv, time);
            
            // Multi-mode visualization based on worldBlend
            // This allows for 5 distinct world types
            float worldEffect;
            
            if (u_worldBlend < 0.2) {
                // Lattice-dominant world
                float blend = u_worldBlend * 5.0;
                worldEffect = mix(lattice, quantum, blend);
            }
            else if (u_worldBlend < 0.4) {
                // Quantum field world
                float blend = (u_worldBlend - 0.2) * 5.0;
                worldEffect = mix(quantum, vortex, blend);
            }
            else if (u_worldBlend < 0.6) {
                // Vortex world
                float blend = (u_worldBlend - 0.4) * 5.0;
                worldEffect = mix(vortex, nebula, blend);
            }
            else if (u_worldBlend < 0.8) {
                // Nebula world
                float blend = (u_worldBlend - 0.6) * 5.0;
                worldEffect = mix(nebula, circuit, blend);
            }
            else {
                // Circuit world
                float blend = (u_worldBlend - 0.8) * 5.0;
                worldEffect = mix(circuit, lattice, blend);
            }
            
            // Add audio-reactive transitions between worlds
            float transitionPulse = u_audioBass * 0.3 * sin(time * 4.0) + 
                                   u_audioMid * 0.2 * sin(time * 6.0);
            
            // Apply world intensity with enhanced glow
            worldEffect *= u_worldIntensity * (1.0 + transitionPulse);
            
            return worldEffect;
        }
        `;
    }
    
    dispose() { console.log("Disposing ShaderManager..."); if (!this.gl) return; try { this.gl.useProgram(null); } catch(e) {} for (const name in this.programs) { if (this.programs[name]) { const p = this.programs[name]; try { const s = this.gl.getAttachedShaders(p); s?.forEach(sh=>this.gl.detachShader(p,sh)); this.gl.deleteProgram(p); } catch (e) {} } } this.programs={}; for (const name in this.compiledShaders) { if(this.compiledShaders[name]) { try {this.gl.deleteShader(this.compiledShaders[name]);} catch(e){} } } this.compiledShaders={}; this.shaderSources={}; this.uniformLocations={}; this.attributeLocations={}; this.currentProgramName=null; this.geometryManager=null; this.projectionManager=null; console.log("ShaderManager disposed."); }
}
// Make ShaderManager globally available
window.ShaderManager = ShaderManager;
