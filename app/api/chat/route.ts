

export async function POST(req: Request) {
  const { messages } = await req.json();
console.log(messages,'this is a message');

        
        const url = 'https://xfsned.buildship.run/getDoc/';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                   'Content-Type': 'application/json',
                },
                body:JSON.stringify(messages)
            });
            console.log(response);
            
            const result = await response.body;
            console.log('Success:', result);
            return result;
}
