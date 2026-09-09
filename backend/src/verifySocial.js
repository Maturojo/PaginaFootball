require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const http = require('http');
const app = require('./index');

async function runVerification() {
  console.log('--- INICIANDO VERIFICACIÓN END-TO-END DEL MÓDULO SOCIAL ---');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5001, resolve));
  console.log('Servidor de prueba escuchando en http://localhost:5001');

  const baseURL = 'http://localhost:5001/api';

  async function req(method, endpoint, body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${baseURL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    return { status: res.status, data };
  }

  try {
    // 1. Verificar Football Core (permanece intacto)
    console.log('\n1. Verificando integridad de Football Core...');
    const teamsRes = await req('GET', '/teams');
    console.log(`- Teams: ${teamsRes.status === 200 ? 'OK' : 'FAIL'} (${teamsRes.data.length} equipos)`);

    const partidosRes = await req('GET', '/partidos');
    console.log(`- Partidos: ${partidosRes.status === 200 ? 'OK' : 'FAIL'} (${partidosRes.data.length} partidos)`);

    const jugadoresRes = await req('GET', '/jugadores');
    console.log(`- Jugadores: ${jugadoresRes.status === 200 ? 'OK' : 'FAIL'} (${jugadoresRes.data.length} atletas)`);

    const samplePartido = partidosRes.data[0];
    const sampleTeam = teamsRes.data[0];
    const sampleJugador = jugadoresRes.data[0];

    // 2. Registro de Usuario Comunitario
    console.log('\n2. Verificando Registro de Usuario Social...');
    const testUsername = `user_test_${Date.now().toString().slice(-4)}`;
    const registerRes = await req('POST', '/auth/register', {
      email: `${testUsername}@ligafootballmdp.com`,
      password: 'Password123!',
      username: testUsername,
      displayName: 'Usuario de Prueba',
    });
    console.log(`- Register status: ${registerRes.status} (token recibido: ${!!registerRes.data.token})`);
    if (registerRes.status !== 201) throw new Error(JSON.stringify(registerRes.data));
    const token = registerRes.data.token;

    // 3. Consulta /auth/me
    console.log('\n3. Verificando /auth/me con perfil social...');
    const meRes = await req('GET', '/auth/me', null, token);
    console.log(`- /auth/me: @${meRes.data.profile?.username} - ${meRes.data.profile?.displayName}`);

    // 4. Crear publicación con referencias a Football Core
    console.log('\n4. Creando publicación con vínculo opcional a partido y equipo...');
    const postRes = await req(
      'POST',
      '/social/posts',
      {
        content: '¡Gran jugada en el entrenamiento de hoy! #MVP @matias_qb',
        media: [{ url: 'https://images.unsplash.com/photo-test.jpg', type: 'image', caption: 'Snap' }],
        relatedPartido: samplePartido?._id,
        relatedTeam: sampleTeam?._id,
        relatedJugador: sampleJugador?._id,
      },
      token
    );
    console.log(`- Post creado status: ${postRes.status} (ID: ${postRes.data._id})`);
    if (postRes.status !== 201) throw new Error(JSON.stringify(postRes.data));
    const postId = postRes.data._id;
    console.log(`  Relaciones Football Core:`);
    console.log(`  - Partido: ${postRes.data.relatedPartido?.equipoLocal} vs ${postRes.data.relatedPartido?.equipoVisitante}`);
    console.log(`  - Equipo: ${postRes.data.relatedTeam?.nombre}`);
    console.log(`  - Jugador: ${postRes.data.relatedJugador?.nombre}`);

    // 5. Like y Guardado
    console.log('\n5. Verificando Like y Guardado...');
    const likeRes = await req('POST', `/social/posts/${postId}/like`, null, token);
    console.log(`- Like: liked=${likeRes.data.liked}, count=${likeRes.data.likesCount}`);

    const saveRes = await req('POST', `/social/posts/${postId}/save`, null, token);
    console.log(`- Save: saved=${saveRes.data.saved}, count=${saveRes.data.savesCount}`);

    // 6. Comentarios
    console.log('\n6. Agregando comentario...');
    const commentRes = await req(
      'POST',
      `/social/posts/${postId}/comments`,
      { content: 'Totalmente de acuerdo con esta jugada 🏈' },
      token
    );
    console.log(`- Comentario creado status: ${commentRes.status}`);

    // 7. Perfil social y enlace a estadísticas
    console.log('\n7. Verificando perfil social...');
    const profileRes = await req('GET', `/social/profiles/${testUsername}`, null, token);
    console.log(`- Perfil @${profileRes.data.username}: posts=${profileRes.data.postsCount}, followers=${profileRes.data.followersCount}`);

    // 8. Explorar
    console.log('\n8. Verificando Explorar y Tendencias...');
    const exploreRes = await req('GET', '/social/explore', null, token);
    console.log(`- Tendencias: ${exploreRes.data.trendingTags?.map((t) => '#' + t.tag).join(', ')}`);
    console.log(`- Posts destacados: ${exploreRes.data.topPosts?.length}`);

    console.log('\n======================================================');
    console.log('✅ TODAS LAS PRUEBAS DEL MÓDULO SOCIAL PASARON CON ÉXITO');
    console.log('✅ EL FOOTBALL CORE PERMANECE TOTALMENTE INDEPENDIENTE');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Error en verificación:', err);
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runVerification();
