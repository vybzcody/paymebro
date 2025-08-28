import { supabase } from './database.js';

/**
 * User service for Web3Auth integration with new schema
 */
export class UserService {
  
  /**
   * Create or update user from Web3Auth login
   */
  async upsertUser({
    web3authUserId,
    walletAddress,
    email,
    name,
    avatarUrl,
    loginProvider
  }) {
    try {
      console.log('🔐 Upserting user:', { web3authUserId, email, loginProvider });

      // Check if user exists by web3auth_user_id or wallet_address
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .or(`web3auth_user_id.eq.${web3authUserId},wallet_address.eq.${walletAddress}`)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let user;
      if (existingUser) {
        // Update existing user
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            web3auth_user_id: web3authUserId,
            wallet_address: walletAddress,
            email,
            name,
            avatar_url: avatarUrl,
            login_provider: loginProvider,
            last_login_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)
          .select()
          .single();

        if (updateError) throw updateError;
        user = updatedUser;
      } else {
        // Create new user
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            web3auth_user_id: web3authUserId,
            wallet_address: walletAddress,
            email,
            name,
            avatar_url: avatarUrl,
            login_provider: loginProvider,
            last_login_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) throw insertError;
        user = newUser;
      }

      console.log('✅ User upserted successfully:', user.email);

      return {
        success: true,
        user: {
          id: user.id,
          web3authUserId: user.web3auth_user_id,
          walletAddress: user.wallet_address,
          email: user.email,
          name: user.name,
          username: user.username,
          avatarUrl: user.avatar_url,
          businessName: user.business_name,
          loginProvider: user.login_provider,
          createdAt: user.created_at
        }
      };
    } catch (error) {
      console.error('Error upserting user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user by ID or Web3Auth ID
   */
  async getUser(identifier) {
    try {
      let query = supabase.from('users').select('*');
      
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      
      if (isUuid) {
        query = query.eq('id', identifier);
      } else {
        query = query.eq('web3auth_user_id', identifier);
      }

      const { data: user, error } = await query.single();
      if (error) throw error;

      return {
        success: true,
        user: {
          id: user.id,
          web3authUserId: user.web3auth_user_id,
          walletAddress: user.wallet_address,
          email: user.email,
          name: user.name,
          username: user.username,
          avatarUrl: user.avatar_url,
          businessName: user.business_name,
          loginProvider: user.login_provider,
          createdAt: user.created_at,
          lastLoginAt: user.last_login_at
        }
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, { username, businessName, businessDescription, websiteUrl }) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .update({
          username,
          business_name: businessName,
          business_description: businessDescription,
          website_url: websiteUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          businessName: user.business_name,
          businessDescription: user.business_description,
          websiteUrl: user.website_url
        }
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default UserService;
