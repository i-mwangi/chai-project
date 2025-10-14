/**
 * Check which servers are running
 */

async function checkServer(port: number, name: string) {
    try {
        const response = await fetch(`http://localhost:${port}/health`, {
            method: 'GET'
        })
        if (response.ok) {
            console.log(`✅ ${name} is running on port ${port}`)
            return true
        } else {
            console.log(`⚠️  ${name} responded with status ${response.status} on port ${port}`)
            return false
        }
    } catch (error) {
        console.log(`❌ ${name} is NOT running on port ${port}`)
        return false
    }
}

async function main() {
    console.log('🔍 Checking server status...\n')
    
    const backend = await checkServer(3001, 'Backend API Server')
    const frontend = await checkServer(3002, 'Frontend Mock Server')
    
    console.log('\n📋 Summary:')
    if (backend && frontend) {
        console.log('✅ Both servers are running - Primary market should work with real database!')
    } else if (!backend && frontend) {
        console.log('⚠️  Only frontend mock server is running - Using in-memory storage')
        console.log('💡 Start the backend server: tsx api/server.ts')
    } else if (backend && !frontend) {
        console.log('⚠️  Only backend is running - Frontend needs to connect directly to port 3001')
    } else {
        console.log('❌ No servers are running')
        console.log('💡 Start backend: tsx api/server.ts')
        console.log('💡 Start frontend: node frontend/api-server.js')
    }
}

main()
