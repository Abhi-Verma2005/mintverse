use anchor_lang::prelude::*;

declare_id!("Bg92pzMfwa22YdhJTZAN42jECR1tmXwyybVEPBubefzm");

#[program]
pub mod my_nft_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
