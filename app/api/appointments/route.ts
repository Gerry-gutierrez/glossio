import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      slug,
      serviceId,
      firstName,
      lastName,
      phone,
      email,
      vehicleYear,
      vehicleMake,
      vehicleModel,
      vehicleColor,
      scheduledDate,
      scheduledTime,
      howHeard,
      notes,
      price,
    } = body

    // Validate required fields
    if (!slug || !serviceId || !firstName || !phone || !scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, serviceId, firstName, phone, scheduledDate, scheduledTime' },
        { status: 400 }
      )
    }

    // Look up profile by slug
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('slug', slug)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Detailer profile not found' }, { status: 404 })
    }

    const profileId = profile.id

    // Upsert client by phone + profile_id
    // First check if client exists
    const { data: existingClient } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('profile_id', profileId)
      .eq('phone', phone)
      .single()

    let clientId: string

    if (existingClient) {
      // Update existing client with latest info
      clientId = existingClient.id
      await supabaseAdmin
        .from('clients')
        .update({
          first_name: firstName,
          last_name: lastName || '',
          email: email || null,
          vehicle_year: vehicleYear || null,
          vehicle_make: vehicleMake || null,
          vehicle_model: vehicleModel || null,
          vehicle_color: vehicleColor || null,
          source: howHeard || null,
        })
        .eq('id', clientId)
    } else {
      // Create new client
      const { data: newClient, error: clientError } = await supabaseAdmin
        .from('clients')
        .insert({
          profile_id: profileId,
          first_name: firstName,
          last_name: lastName || '',
          email: email || null,
          phone,
          vehicle_year: vehicleYear || null,
          vehicle_make: vehicleMake || null,
          vehicle_model: vehicleModel || null,
          vehicle_color: vehicleColor || null,
          source: howHeard || null,
          notes: notes || null,
        })
        .select('id')
        .single()

      if (clientError || !newClient) {
        return NextResponse.json({ error: 'Failed to create client record' }, { status: 500 })
      }
      clientId = newClient.id
    }

    // Create appointment
    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .insert({
        profile_id: profileId,
        client_id: clientId,
        service_id: serviceId,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        notes: notes || null,
        price: parseFloat(price) || 0,
        status: 'pending',
      })
      .select('id')
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Failed to create appointment', details: appointmentError?.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      appointmentId: appointment.id,
      clientId,
    })
  } catch (error) {
    console.error('Appointment creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
