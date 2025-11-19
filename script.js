document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. LÓGICA DE AUTOFOCUS (Mover o cursor após digitar um dígito)
    // =========================================================================

    function setupCepAutofocus(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return; // Sai se o container não for encontrado

        // Seleciona todos os inputs de CEP dentro do container
        const inputs = container.querySelectorAll('.zip-input');

        inputs.forEach((input, index) => {
            // Evento 'input' dispara sempre que o valor do input muda (digitação)
            input.addEventListener('input', () => {
                // Verifica se o campo atual atingiu o limite de 1 caractere
                if (input.value.length === input.maxLength) {
                    // Se houver um próximo campo, move o foco para ele
                    if (index < inputs.length - 1) {
                        inputs[index + 1].focus();
                    }
                }
            });
            
            // Opcional: Melhora a usabilidade permitindo voltar o foco ao apagar (Backspace)
            input.addEventListener('keydown', (e) => {
                // Se a tecla pressionada for Backspace E o campo atual estiver vazio
                if (e.key === 'Backspace' && input.value.length === 0) {
                    // Se não for o primeiro campo, move o foco para o anterior
                    if (index > 0) {
                        inputs[index - 1].focus();
                    }
                }
            });
        });
    }

    // Aplica a lógica de autofocus aos dois grupos de CEP
    setupCepAutofocus('dest-cep-container');
    setupCepAutofocus('rem-cep-container');
    
    // Acessa o formulário pelo ID
    const form = document.getElementById('envioForm');

    // Escuta o evento de envio (submit)
    form.addEventListener('submit', function(e) {
        // Interrompe o envio padrão do formulário
        e.preventDefault(); 
        
        // Função auxiliar para coletar os 8 inputs do CEP e formatá-los (00000-000)
        function getCep(prefixo) {
            let cep = '';
            // Seletor para os 8 inputs de CEP
            const inputs = document.querySelectorAll(`#${prefixo}-cep-container .zip-input`);
            
            inputs.forEach(input => {
                cep += input.value.trim();
            });
            
            // Retorna o CEP formatado
            if (cep.length === 8) {
                return cep.substring(0, 5) + '-' + cep.substring(5, 8);
            }
            return cep; // Retorna o CEP sem formatar se não tiver 8 dígitos
        }

        // 1. Coleta de Dados

        // Dados do Destinatário
        const dest = {
            nome: document.getElementById('dest-nome').value,
            endereco: document.getElementById('dest-endereco').value,
            complemento: document.getElementById('dest-complemento').value,
            telefone: document.getElementById('dest-telefone').value,
            cep: getCep('dest'),
            cidade: document.getElementById('dest-cidade').value,
            uf: document.getElementById('dest-uf').value.toUpperCase(),
            pais: document.getElementById('dest-pais').value
        };

        // Dados do Remetente
        const rem = {
            nome: document.getElementById('rem-nome').value,
            endereco: document.getElementById('rem-endereco').value,
            complemento: document.getElementById('rem-complemento').value,
            telefone: document.getElementById('rem-telefone').value,
            cep: getCep('rem'),
            cidade: document.getElementById('rem-cidade').value,
            uf: document.getElementById('rem-uf').value.toUpperCase(),
            pais: document.getElementById('rem-pais').value
        };
        
        // 2. Criação do Conteúdo em Texto
        const titulo = "DETALHES DA ENCOMENDA\n\n";

        const dest_texto = 
            "====================== DESTINATÁRIO ======================\n" +
            `Nome: ${dest.nome}\n` +
            `Endereço: ${dest.endereco}` + (dest.complemento ? ` (Comp: ${dest.complemento})` : '') + `\n` +
            `CEP: ${dest.cep} | Cidade/UF: ${dest.cidade}/${dest.uf}\n` +
            `País: ${dest.pais}\n` +
            `Telefone: ${dest.telefone}\n\n`;

        const rem_texto = 
            "========================= REMETENTE =========================\n" +
            `Nome: ${rem.nome}\n` +
            `Endereço: ${rem.endereco}` + (rem.complemento ? ` (Comp: ${rem.complemento})` : '') + `\n` +
            `CEP: ${rem.cep} | Cidade/UF: ${rem.cidade}/${rem.uf}\n` +
            `País: ${rem.pais}\n` +
            `Telefone: ${rem.telefone}\n\n`;

        const conteudoCompleto = titulo + dest_texto + rem_texto;


        // 3. Geração do PDF usando jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configurações da fonte
        doc.setFont('helvetica'); // Fonte padrão
        doc.setFontSize(10); 
        
        // A função splitTextToSize é necessária para quebras de linha automáticas
        const linhas = doc.splitTextToSize(conteudoCompleto, 180); // 180 é a largura máxima na página (margem de 15pt)
        
        // Adiciona o texto ao documento nas coordenadas (x=10, y=10)
        doc.text(linhas, 15, 15); 

        // 4. Salvar o arquivo PDF
        const nomeArquivo = `Envio_${dest.nome.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '')}.pdf`;
        doc.save(nomeArquivo);

        // Opcional: Limpar o formulário após o download
        // form.reset(); 
    });
});